from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize extensions
db = SQLAlchemy()
bcrypt = Bcrypt()
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

def create_app():
    app = Flask(__name__)

    # --- Configuration ---
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    app.config['JWT_REFRESH_SECRET_KEY'] = os.getenv('JWT_REFRESH_SECRET_KEY')

    # --- Initialize Extensions with App ---
    db.init_app(app)
    bcrypt.init_app(app)
    limiter.init_app(app)

    # --- Register Blueprints (Routes) ---
    from routes.auth import auth_bp
    # The API endpoints will have a prefix of /api/auth
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    # --- Global Error Handlers ---
    @app.errorhandler(429)
    def ratelimit_handler(e):
        return jsonify(error="ratelimit exceeded %s" % e.description), 429

    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        # This will create the database tables if they don't exist
        db.create_all()
    app.run(debug=True)