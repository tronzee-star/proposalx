import datetime
from flask import request, jsonify
from app import db
from app.models.evaluation import Evaluation, PASS_MARK
from app.models.proposal import Proposal
from app.models.user import User

def get_all_evaluations(current_user):
    """Get evaluations for the current reviewer."""
    evaluations = Evaluation.query.filter_by(reviewer_id=current_user.id).all()
    result = []
    for ev in evaluations:
        proposal = Proposal.query.get(ev.proposal_id)
        submitter = User.query.get(proposal.submitter_id) if proposal else None
        result.append({
            **ev.to_dict(),
            'submitter_name': submitter.name if submitter else None,
            'phone': proposal.contact if proposal else None,
            'institution': proposal.institution if proposal else None,
            'proposal_title': proposal.title if proposal else None,
        })
    return jsonify(result), 200

def get_evaluation_by_proposal(current_user, proposal_id):
    """Get the current reviewer's evaluation for a specific proposal."""
    evaluation = Evaluation.query.filter_by(
        proposal_id=proposal_id, reviewer_id=current_user.id
    ).first()
    if not evaluation:
        return jsonify({'message': 'Evaluation not found'}), 404
    return jsonify(evaluation.to_dict()), 200

def submit_evaluation(current_user):
    data = request.get_json()
    proposal_id = data.get('proposal_id')
    scores = data.get('scores', {})
    comments = data.get('comments', '')

    if not proposal_id:
        return jsonify({'message': 'Proposal ID is required'}), 400

    proposal = Proposal.query.get_or_404(proposal_id)

    # Find this reviewer's pending evaluation
    evaluation = Evaluation.query.filter_by(
        proposal_id=proposal_id, reviewer_id=current_user.id
    ).first()

    if not evaluation:
        return jsonify({'message': 'You are not assigned to review this proposal'}), 403

    if evaluation.status != 'pending':
        return jsonify({'message': 'You have already reviewed this proposal'}), 409

    total = sum(scores.values())
    evaluation.scores = scores
    evaluation.total_score = total
    evaluation.comments = comments
    evaluation.status = 'accepted' if total >= PASS_MARK else 'declined'
    evaluation.evaluated_at = datetime.datetime.utcnow()

    # Check if all 4 reviewers have completed — update proposal status
    all_evals = Evaluation.query.filter_by(proposal_id=proposal_id).all()
    completed = [e for e in all_evals if e.status != 'pending']
    if len(completed) == 4:
        avg = sum(e.total_score for e in completed) / 4
        proposal.status = 'accepted' if avg >= PASS_MARK else 'declined'

    db.session.commit()
    return jsonify(evaluation.to_dict()), 200

def get_stats(current_user):
    total = Proposal.query.count()
    accepted = Proposal.query.filter_by(status='accepted').count()
    declined = Proposal.query.filter_by(status='declined').count()
    pending = Proposal.query.filter_by(status='pending').count()
    reviewed = accepted + declined
    active_reviewers = User.query.filter_by(role='reviewer').count()

    completed_evals = Evaluation.query.filter(Evaluation.status != 'pending').all()
    avg_score = round(sum(e.total_score for e in completed_evals) / len(completed_evals), 1) if completed_evals else 0

    # Current reviewer's stats
    my_evals = Evaluation.query.filter_by(reviewer_id=current_user.id).all()
    my_completed = [e for e in my_evals if e.status != 'pending']
    my_pending = [e for e in my_evals if e.status == 'pending']
    my_accepted = [e for e in my_evals if e.status == 'accepted']
    my_declined = [e for e in my_evals if e.status == 'declined']

    return jsonify({
        'totalProposals': total,
        'reviewed': reviewed,
        'pending': len(my_pending),
        'accepted': len(my_accepted),
        'declined': len(my_declined),
        'averageScore': avg_score,
        'activeReviewers': active_reviewers,
        'myCompleted': len(my_completed),
        'myPending': len(my_pending),
        'passmark': PASS_MARK,
    }), 200
