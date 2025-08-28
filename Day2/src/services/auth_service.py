from main import db, bcrypt
from models.user import User
import jwt
import datetime
from flask import current_app

def register_user(email, password):
    user = User.query.filter_by(email=email).first()
    if user:
        raise Exception('User with this email already exists.')

    # Securely hash the password using bcrypt
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(email=email, password_hash=hashed_password)
    
    db.session.add(new_user)
    db.session.commit()
    return new_user

def login_user(email, password):
    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password_hash, password):
        # Generate JWT tokens
        access_token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
        
        refresh_token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
        }, current_app.config['JWT_REFRESH_SECRET_KEY'], algorithm='HS256')

        return {'access_token': access_token, 'refresh_token': refresh_token}
    return None

def refresh_access_token(refresh_token):
    try:
        payload = jwt.decode(
            refresh_token, 
            current_app.config['JWT_REFRESH_SECRET_KEY'], 
            algorithms=['HS256']
        )
        user_id = payload['user_id']
        
        # Generate a new access token
        access_token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')
        
        return access_token
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None