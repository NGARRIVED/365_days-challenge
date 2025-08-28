from flask import Blueprint, request, jsonify
from pydantic import BaseModel, EmailStr, ValidationError
import services.auth_service as auth_service
from utils.decorators import token_required
from main import limiter

auth_bp = Blueprint('auth', __name__)

# --- Pydantic Models for Input Validation ---
class UserRegistration(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# --- API Endpoints ---
@auth_bp.route('/register', methods=['POST'])
@limiter.limit("5 per minute") # Rate limiting for registration
def register():
    try:
        user_data = UserRegistration(**request.json)
        new_user = auth_service.register_user(user_data.email, user_data.password)
        return jsonify({'message': f'User {new_user.email} created successfully.'}), 201
    except ValidationError as e:
        return jsonify({'error': 'Invalid input', 'details': e.errors()}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 409 # 409 Conflict for existing user

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        login_data = UserLogin(**request.json)
        tokens = auth_service.login_user(login_data.email, login_data.password)
        if not tokens:
            return jsonify({'error': 'Invalid credentials'}), 401
        return jsonify(tokens), 200
    except ValidationError as e:
        return jsonify({'error': 'Invalid input', 'details': e.errors()}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    refresh_token = request.headers.get('Authorization')
    if not refresh_token or not refresh_token.startswith('Bearer '):
        return jsonify({'error': 'Refresh token is missing or invalid'}), 401

    token = refresh_token.split(' ')[1]
    new_access_token = auth_service.refresh_access_token(token)

    if not new_access_token:
        return jsonify({'error': 'Invalid or expired refresh token'}), 401

    return jsonify({'access_token': new_access_token}), 200

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    # The current_user object is passed from the @token_required decorator
    return jsonify({
        'id': current_user.id,
        'email': current_user.email,
        'created_at': current_user.created_at
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    # For JWT, logout is typically handled client-side by deleting the token.
    # A more advanced implementation could use a server-side token blocklist.
    return jsonify({'message': 'Logged out successfully. Please discard your token.'}), 200