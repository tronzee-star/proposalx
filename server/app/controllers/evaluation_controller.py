from flask import request, jsonify
from app import db
from app.models.evaluation import Evaluation
from app.models.proposal import Proposal
from app.models.user import User
from app.services.grading_service import calculate_total_score, calculate_average_score, determine_status

def get_all_evaluations(current_user):
    evaluations = Evaluation.query.all()
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
            'status': proposal.status if proposal else None,
        })
    return jsonify(result), 200

def get_evaluation_by_proposal(current_user, proposal_id):
    evaluation = Evaluation.query.filter_by(proposal_id=proposal_id).first()
    if not evaluation:
        return jsonify({'message': 'Evaluation not found'}), 404
    return jsonify(evaluation.to_dict()), 200

def submit_evaluation(current_user):
    data = request.get_json()
    proposal_id = data.get('proposal_id')
    scores = data.get('scores', {})
    comments = data.get('comments', '')
    recommendation = data.get('recommendation')

    if not all([proposal_id, recommendation]):
        return jsonify({'message': 'Proposal ID and recommendation are required'}), 400

    proposal = Proposal.query.get_or_404(proposal_id)

    existing = Evaluation.query.filter_by(proposal_id=proposal_id).first()
    if existing:
        return jsonify({'message': 'This proposal has already been evaluated'}), 409

    total = calculate_total_score(scores)
    average = calculate_average_score(scores)

    evaluation = Evaluation(
        proposal_id=proposal_id,
        reviewer_id=current_user.id,
        total_score=total,
        average_score=average,
        comments=comments,
        recommendation=recommendation,
    )
    evaluation.scores = scores
    db.session.add(evaluation)

    proposal.status = determine_status(recommendation)
    proposal.reviewer_id = current_user.id
    db.session.commit()

    return jsonify(evaluation.to_dict()), 201

def get_stats(current_user):
    total = Proposal.query.count()
    pending = Proposal.query.filter_by(status='pending').count()
    under_review = Proposal.query.filter_by(status='under review').count()
    approved = Proposal.query.filter_by(status='approved').count()
    rejected = Proposal.query.filter_by(status='rejected').count()
    reviewed = approved + rejected
    active_reviewers = User.query.filter_by(role='reviewer').count()

    evals = Evaluation.query.all()
    avg_score = round(sum(e.average_score for e in evals) / len(evals), 1) if evals else 0

    return jsonify({
        'totalProposals': total,
        'reviewed': reviewed,
        'pending': pending,
        'underReview': under_review,
        'approved': approved,
        'rejected': rejected,
        'averageScore': avg_score,
        'activeReviewers': active_reviewers,
    }), 200
