from flask import Blueprint
from app.utils.token_utils import token_required, role_required
from app.controllers.proposal_controller import (
    get_all_proposals, get_my_proposals, get_proposal_by_id, submit_proposal, get_proposal_file
)

proposal_bp = Blueprint('proposal', __name__)

@proposal_bp.route('/', methods=['GET'])
@token_required
def list_proposals(current_user):
    return get_all_proposals(current_user)

@proposal_bp.route('/my/', methods=['GET'])
@token_required
def my_proposals(current_user):
    return get_my_proposals(current_user)

@proposal_bp.route('/<int:proposal_id>', methods=['GET'])
@token_required
def proposal_detail(current_user, proposal_id):
    return get_proposal_by_id(current_user, proposal_id)

@proposal_bp.route('/', methods=['POST'])
@token_required
@role_required('submitter')
def create_proposal(current_user):
    return submit_proposal(current_user)

@proposal_bp.route('/<int:proposal_id>/file', methods=['GET'])
@token_required
def download_file(current_user, proposal_id):
    return get_proposal_file(current_user, proposal_id)
