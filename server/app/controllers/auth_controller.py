from flask import request, jsonify
from app import db
from app.models.user import User
from app.utils.token_utils import generate_token

def register():
    return jsonify({'message': 'Registration is disabled. Contact admin for access.'}), 403

def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'message': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid email or password'}), 401

    token = generate_token(user.id)
    return jsonify({'token': token, 'user': user.to_dict()}), 200
