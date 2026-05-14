from flask import jsonify
from app import db
from app.models.user import User
from app.models.proposal import Proposal
from app.models.evaluation import Evaluation


def get_all_users(current_user):
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify([u.to_dict() for u in users]), 200


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
