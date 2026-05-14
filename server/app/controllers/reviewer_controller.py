from flask import jsonify
from app.models.user import User
from app.models.evaluation import Evaluation

def get_reviewer_activity(current_user):
    # Reviewers only see their own progress; admins see all
    if current_user.role == 'admin':
        reviewers = User.query.filter_by(role='reviewer').all()
    else:
        reviewers = [current_user]
    result = []
    for r in reviewers:
        total = Evaluation.query.filter_by(reviewer_id=r.id).count()
        completed = Evaluation.query.filter(
            Evaluation.reviewer_id == r.id,
            Evaluation.status != 'pending'
        ).count()
        result.append({
            'id': r.id,
            'name': r.name,
            'completed_reviews': completed,
            'total_assigned': total,
            'progress_percent': round((completed / total) * 100) if total > 0 else 0,
        })
    return jsonify(result), 200
