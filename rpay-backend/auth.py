import random
from datetime import datetime, timedelta, timezone
from flask import Blueprint, request, jsonify, session
from pymysql import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash
from flask_login import login_user, logout_user, login_required
from models import User
from extensions import db
from services import send_otp_email

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data['email']
    password = data['password']

    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password, password):
        login_user(user, remember=True)
        return jsonify({'message': 'Login successful',
                        'name': user.name}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    upi = data.get('upi')

    if not all([username, password, email, upi]):
        return jsonify({"message": "All fields are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User with this email already registered"}), 400

    try:
        user = User(
            name=username,
            email=email,
            password=generate_password_hash(password),
            upi=generate_password_hash(upi)
        )
        db.session.add(user)
        db.session.commit()
        return jsonify({"message": "User registered"}), 200
    except IntegrityError as e:
        db.session.rollback()
        return jsonify({"message": "Integrity error: " + str(e)}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error: " + str(e)}), 500


def handle_otp_request():
    data = request.get_json()
    email = data.get('email')

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "User not found with given email"}), 404

    if user.otp_generated_at:
        now = datetime.now(timezone.utc)
        last_otp_time = user.otp_generated_at

        if last_otp_time.tzinfo is None:
            last_otp_time = last_otp_time.replace(tzinfo=timezone.utc)

        if (now - last_otp_time) < timedelta(minutes=5):
            remaining = timedelta(minutes=5) - (now - last_otp_time)
            return jsonify({
                "message": f"Wait {remaining.seconds // 60} minutes and {remaining.seconds % 60} seconds before resending OTP"
            }), 429

    otp = str(random.randint(1000, 9999))
    user.otp = otp
    user.otp_generated_at = datetime.now(timezone.utc)
    db.session.commit()
    return send_otp_email(user, otp)

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    return handle_otp_request()

@auth_bp.route('/resend-otp', methods=['POST'])
def resend_otp():
    return handle_otp_request()

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')

    if not email or not otp:
        return jsonify({"message": "Email and OTP are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "User not found with given email"}), 404

    if not user.otp or not user.otp_generated_at:
        return jsonify({"message": "No OTP generated for this user"}), 400

    now = datetime.now(timezone.utc)
    generated_at = user.otp_generated_at
    if generated_at.tzinfo is None:
        generated_at = generated_at.replace(tzinfo=timezone.utc)

    if (now - generated_at) > timedelta(minutes=5):
        return jsonify({"message": "OTP has expired"}), 400

    if str(user.otp) != str(otp):
        return jsonify({"message": "Invalid OTP"}), 400

    session['reset_email'] = user.email
    user.otp = None
    user.otp_generated_at = None
    user.otp_verified = True
    db.session.commit()

    return jsonify({"message": "OTP verified successfully"}), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    new_password = data.get('password')
    email = session.get('reset_email')

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "User not found with given email"}), 404

    if not user.otp_verified:
        return jsonify({"message": "OTP not verified"}), 403

    user.password = generate_password_hash(new_password)
    user.otp_verified = False
    db.session.commit()

    return jsonify({'message': 'Password changed successfully'}), 200

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out'})