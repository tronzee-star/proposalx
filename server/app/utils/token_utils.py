import jwt
import datetime
from flask import current_app, request, jsonify
from functools import wraps
from app.models.user import User

def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24),
        'iat': datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            print(f"[AUTH] Token decoded OK, user_id={payload['user_id']}")
            current_user = User.query.get(payload['user_id'])
            if not current_user:
                print(f"[AUTH] User {payload['user_id']} not found in DB")
                return jsonify({'message': 'User not found'}), 401
            print(f"[AUTH] Authenticated: {current_user.name} ({current_user.role})")
        except jwt.ExpiredSignatureError:
            print("[AUTH] Token expired")
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError as e:
            print(f"[AUTH] Invalid token: {e}")
            return jsonify({'message': 'Invalid token'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

def role_required(role):
    def decorator(f):
        @wraps(f)
        def decorated(current_user, *args, **kwargs):
            if current_user.role != role:
                return jsonify({'message': 'Permission denied'}), 403
            return f(current_user, *args, **kwargs)
        return decorated
    return decorator
