from flask import jsonify
from app.models.user import User
from app.models.evaluation import Evaluation

def get_reviewer_activity(current_user):
    reviewers = User.query.filter_by(role='reviewer').all()
    result = []
    for r in reviewers:
        completed = Evaluation.query.filter(
            Evaluation.reviewer_id == r.id,
            Evaluation.status != 'pending'
        ).count()
        result.append({
            'id': r.id,
            'name': r.name,
            'completed_reviews': completed,
        })
    return jsonify(result), 200
