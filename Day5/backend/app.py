from flask import Flask, request, jsonify, redirect, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import string
import random
import os
from datetime import datetime, timedelta
import qrcode
from io import BytesIO
import base64

app = Flask(__name__)
CORS(app)

# --- Database Configuration ---
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'urls.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- Database Model ---
class Url(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    long_url = db.Column(db.String(), nullable=False)
    short_code = db.Column(db.String(6), unique=True, nullable=False)
    click_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_accessed = db.Column(db.DateTime)
    expires_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'long_url': self.long_url,
            'short_code': self.short_code,
            'click_count': self.click_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_accessed': self.last_accessed.isoformat() if self.last_accessed else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'is_expired': self.expires_at and datetime.utcnow() > self.expires_at
        }

def generate_short_code():
    """Generate a random 6-character short code."""
    characters = string.ascii_letters + string.digits
    while True:
        short_code = ''.join(random.choices(characters, k=6))
        if not Url.query.filter_by(short_code=short_code).first():
            return short_code

# --- API Routes ---

@app.route('/shorten', methods=['POST'])
def shorten_url():
    """Create a new short URL."""
    data = request.get_json()
    long_url = data.get('long_url')
    custom_code = data.get('custom_code', '').strip()
    expiration_days = data.get('expiration_days')

    if not long_url:
        return jsonify({'error': 'URL is required'}), 400

    # Calculate expiration date if provided
    expires_at = None
    if expiration_days and expiration_days > 0:
        expires_at = datetime.utcnow() + timedelta(days=expiration_days)

    # Validate custom code if provided
    if custom_code:
        if len(custom_code) < 3 or len(custom_code) > 20:
            return jsonify({'error': 'Custom alias must be between 3-20 characters'}), 400
        
        if not custom_code.replace('-', '').replace('_', '').isalnum():
            return jsonify({'error': 'Custom alias can only contain letters, numbers, hyphens, and underscores'}), 400
        
        # Check if custom code already exists
        existing_code = Url.query.filter_by(short_code=custom_code).first()
        if existing_code:
            return jsonify({'error': 'This custom alias is already taken'}), 400
        
        short_code = custom_code
    else:
        # Check if the URL has already been shortened
        existing_url = Url.query.filter_by(long_url=long_url).first()
        if existing_url:
            short_url = request.host_url + existing_url.short_code
            return jsonify({'short_url': short_url})
        
        # Generate random short code
        short_code = generate_short_code()

    # Create a new short URL
    new_url = Url(long_url=long_url, short_code=short_code, expires_at=expires_at)
    db.session.add(new_url)
    db.session.commit()

    short_url = request.host_url + short_code
    return jsonify({'short_url': short_url}), 201

@app.route('/<short_code>', methods=['GET'])
def redirect_to_long_url(short_code):
    """Redirect to the original long URL and track the click."""
    url_entry = Url.query.filter_by(short_code=short_code).first_or_404()
    
    # Check if URL has expired
    if url_entry.expires_at and datetime.utcnow() > url_entry.expires_at:
        return jsonify({'error': 'This short URL has expired'}), 410
    
    # Track the click
    url_entry.click_count += 1
    url_entry.last_accessed = datetime.utcnow()
    db.session.commit()
    
    return redirect(url_entry.long_url)

@app.route('/analytics', methods=['GET'])
def get_analytics():
    """Get analytics for all URLs."""
    urls = Url.query.all()
    return jsonify([url.to_dict() for url in urls])

@app.route('/analytics/<short_code>', methods=['GET'])
def get_url_analytics(short_code):
    """Get analytics for a specific URL."""
    url_entry = Url.query.filter_by(short_code=short_code).first_or_404()
    return jsonify(url_entry.to_dict())

@app.route('/qr/<short_code>', methods=['GET'])
def generate_qr_code(short_code):
    """Generate QR code for a short URL."""
    url_entry = Url.query.filter_by(short_code=short_code).first_or_404()
    
    # Build the full short URL
    short_url = request.host_url + short_code
    
    try:
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(short_url)
        qr.make(fit=True)
        
        # Create QR code image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64 for JSON response
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        # Return base64 encoded image
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return jsonify({
            'qr_code': f'data:image/png;base64,{img_str}',
            'short_url': short_url
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to generate QR code: {str(e)}'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5002)
