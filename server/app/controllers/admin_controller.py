import os
from flask import jsonify, request, current_app
from werkzeug.utils import secure_filename
from app import db
from app.models.user import User
from app.models.proposal import Proposal
from app.models.evaluation import Evaluation

ALLOWED_EXTENSIONS = {'pdf', 'docx'}

def _allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_all_users(current_user):
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in users]), 200


def create_user(current_user):
    data = request.get_json() or {}
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'reviewer')

    if not all([name, email, password]):
        return jsonify({'message': 'Name, email and password are required'}), 400
    if role not in ('reviewer', 'admin'):
        return jsonify({'message': 'Invalid role'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'}), 409

    user = User(name=name, email=email, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201


def delete_user(current_user, user_id):
    user = User.query.get_or_404(user_id)
    if user.role == 'admin':
        return jsonify({'message': 'Cannot delete admin account'}), 403

    # Delete related evaluations
    Evaluation.query.filter_by(reviewer_id=user.id).delete()
    # Delete proposals submitted by this user and their evaluations
    proposals = Proposal.query.filter_by(submitter_id=user.id).all()
    for p in proposals:
        Evaluation.query.filter_by(proposal_id=p.id).delete()
        db.session.delete(p)

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': f'User {user.name} deleted'}), 200


def get_all_proposals(current_user):
    proposals = Proposal.query.order_by(Proposal.submitted_at.desc()).all()
    result = []
    for p in proposals:
        data = p.to_dict()
        submitter = User.query.get(p.submitter_id)
        data['submitter_name'] = submitter.name if submitter else 'Unknown'
        result.append(data)
    return jsonify(result), 200


def delete_proposal(current_user, proposal_id):
    proposal = Proposal.query.get_or_404(proposal_id)
    Evaluation.query.filter_by(proposal_id=proposal.id).delete()
    db.session.delete(proposal)
    db.session.commit()
    return jsonify({'message': f'Proposal "{proposal.title}" deleted'}), 200


def get_reviewers(current_user):
    reviewers = User.query.filter_by(role='reviewer').all()
    return jsonify([u.to_dict() for u in reviewers]), 200


def upload_proposal(current_user):
    title = request.form.get('title')
    reviewer_ids_raw = request.form.get('reviewer_ids', '')

    if not title:
        return jsonify({'message': 'Title is required'}), 400

    try:
        reviewer_ids = [int(x) for x in reviewer_ids_raw.split(',') if x.strip()]
    except ValueError:
        return jsonify({'message': 'Invalid reviewer IDs'}), 400

    if len(reviewer_ids) < 3:
        return jsonify({'message': 'At least 3 reviewers must be allocated'}), 400

    # Validate all reviewer IDs exist and are reviewers
    reviewers = User.query.filter(User.id.in_(reviewer_ids), User.role == 'reviewer').all()
    if len(reviewers) != len(reviewer_ids):
        return jsonify({'message': 'One or more selected reviewers are invalid'}), 400

    file_path = None
    if 'file' in request.files:
        file = request.files['file']
        if file and file.filename and _allowed_file(file.filename):
            filename = secure_filename(file.filename)
            upload_dir = current_app.config['UPLOAD_FOLDER']
            os.makedirs(upload_dir, exist_ok=True)
            file_path = os.path.join(upload_dir, filename)
            file.save(file_path)

    proposal = Proposal(
        title=title,
        file_path=file_path,
        submitter_id=current_user.id,  # admin uploaded
        status='pending',
    )
    db.session.add(proposal)
    db.session.flush()

    for r in reviewers:
        ev = Evaluation(proposal_id=proposal.id, reviewer_id=r.id, status='pending')
        db.session.add(ev)

    db.session.commit()
    return jsonify(proposal.to_dict()), 201


def get_admin_stats(current_user):
    total_users = User.query.count()
    total_submitters = User.query.filter_by(role='submitter').count()
    total_reviewers = User.query.filter_by(role='reviewer').count()
    total_proposals = Proposal.query.count()
    pending_proposals = Proposal.query.filter_by(status='pending').count()
    accepted_proposals = Proposal.query.filter_by(status='accepted').count()
    declined_proposals = Proposal.query.filter_by(status='declined').count()

    return jsonify({
        'totalUsers': total_users,
        'totalSubmitters': total_submitters,
        'totalReviewers': total_reviewers,
        'totalProposals': total_proposals,
        'pendingProposals': pending_proposals,
        'acceptedProposals': accepted_proposals,
        'declinedProposals': declined_proposals,
    }), 200
