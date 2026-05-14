from flask import Blueprint
from app.utils.token_utils import token_required
from app.controllers.reviewer_controller import get_reviewer_activity

reviewer_bp = Blueprint('reviewer', __name__)

@reviewer_bp.route('/activity', methods=['GET'])
@token_required
def reviewer_activity(current_user):
    return get_reviewer_activity(current_user)
