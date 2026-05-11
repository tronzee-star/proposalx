from flask import request, jsonify
from app import db
from app.models.user import User
from app.utils.token_utils import generate_token

def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'submitter')

    if not all([name, email, password]):
        return jsonify({'message': 'Name, email, and password are required'}), 400

    if role not in ['submitter', 'reviewer']:
        return jsonify({'message': 'Invalid role'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already registered'}), 409

    user = User(name=name, email=email, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = generate_token(user.id)
    return jsonify({'token': token, 'user': user.to_dict()}), 201

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
