from flask import Blueprint
from app.utils.token_utils import token_required, role_required
from app.controllers.admin_controller import (
    get_all_users, create_user, delete_user, get_all_proposals, delete_proposal,
    get_admin_stats, get_reviewers, upload_proposal
)

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/stats/', methods=['GET'])
@token_required
@role_required('admin')
def stats(current_user):
    return get_admin_stats(current_user)


@admin_bp.route('/users/', methods=['GET'])
@token_required
@role_required('admin')
def list_users(current_user):
    return get_all_users(current_user)


@admin_bp.route('/users/', methods=['POST'])
@token_required
@role_required('admin')
def add_user(current_user):
    return create_user(current_user)


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@token_required
@role_required('admin')
def remove_user(current_user, user_id):
    return delete_user(current_user, user_id)


@admin_bp.route('/proposals/', methods=['GET'])
@token_required
@role_required('admin')
def list_proposals(current_user):
    return get_all_proposals(current_user)


@admin_bp.route('/proposals/', methods=['POST'])
@token_required
@role_required('admin')
def create_proposal(current_user):
    return upload_proposal(current_user)


@admin_bp.route('/proposals/<int:proposal_id>', methods=['DELETE'])
@token_required
@role_required('admin')
def remove_proposal(current_user, proposal_id):
    return delete_proposal(current_user, proposal_id)


@admin_bp.route('/reviewers/', methods=['GET'])
@token_required
@role_required('admin')
def list_reviewers(current_user):
    return get_reviewers(current_user)
