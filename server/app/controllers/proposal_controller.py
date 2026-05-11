import os
from flask import request, jsonify, current_app, send_file
from werkzeug.utils import secure_filename
from app import db
from app.models.proposal import Proposal

ALLOWED_EXTENSIONS = {'pdf', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_all_proposals(current_user):
    proposals = Proposal.query.order_by(Proposal.submitted_at.desc()).all()
    return jsonify([p.to_dict() for p in proposals]), 200

def get_my_proposals(current_user):
    proposals = Proposal.query.filter_by(submitter_id=current_user.id).order_by(Proposal.submitted_at.desc()).all()
    return jsonify([p.to_dict() for p in proposals]), 200

def get_proposal_by_id(current_user, proposal_id):
    proposal = Proposal.query.get_or_404(proposal_id)
    return jsonify(proposal.to_dict()), 200

def submit_proposal(current_user):
    title = request.form.get('title')
    institution = request.form.get('institution')
    category = request.form.get('category')
    contact = request.form.get('contact')
    description = request.form.get('description')

    if not all([title, institution, category, contact, description]):
        return jsonify({'message': 'All fields are required'}), 400

    file_path = None
    if 'file' in request.files:
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            upload_dir = current_app.config['UPLOAD_FOLDER']
            os.makedirs(upload_dir, exist_ok=True)
            file_path = os.path.join(upload_dir, filename)
            file.save(file_path)

    proposal = Proposal(
        title=title,
        institution=institution,
        category=category,
        contact=contact,
        description=description,
        file_path=file_path,
        submitter_id=current_user.id,
        status='pending',
    )
    db.session.add(proposal)
    db.session.commit()

    return jsonify(proposal.to_dict()), 201

def get_proposal_file(current_user, proposal_id):
    proposal = Proposal.query.get_or_404(proposal_id)
    if not proposal.file_path or not os.path.exists(proposal.file_path):
        return jsonify({'message': 'File not found'}), 404
    return send_file(proposal.file_path, as_attachment=True)
