from flask import Blueprint
from app.utils.token_utils import token_required, role_required
from app.controllers.evaluation_controller import (
    get_all_evaluations, get_evaluation_by_proposal, submit_evaluation, get_stats
)

evaluation_bp = Blueprint('evaluation', __name__)

@evaluation_bp.route('/', methods=['GET'])
@token_required
@role_required('reviewer')
def list_evaluations(current_user):
    return get_all_evaluations(current_user)

@evaluation_bp.route('/proposal/<int:proposal_id>', methods=['GET'])
@token_required
def evaluation_by_proposal(current_user, proposal_id):
    return get_evaluation_by_proposal(current_user, proposal_id)

@evaluation_bp.route('/', methods=['POST'])
@token_required
@role_required('reviewer')
def create_evaluation(current_user):
    return submit_evaluation(current_user)

@evaluation_bp.route('/stats/', methods=['GET'])
@token_required
@role_required('reviewer')
def stats(current_user):
    return get_stats(current_user)
