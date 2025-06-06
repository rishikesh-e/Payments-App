from datetime import datetime, timezone
from flask_login import UserMixin
from extensions import db
from sqlalchemy import DateTime

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    upi = db.Column(db.String(255), nullable=False)
    wallets = db.relationship('Wallet', backref='user', lazy=True)
    otp = db.Column(db.String(4), nullable=True)
    otp_generated_at = db.Column(DateTime(timezone=True), nullable=True)
    otp_verified = db.Column(db.Boolean, default=False, nullable=False)

    sent_transactions = db.relationship('Transaction', backref='sender',
                                        foreign_keys='Transaction.sender_id', lazy=True)
    received_transactions = db.relationship('Transaction', backref='receiver',
                                            foreign_keys='Transaction.receiver_id', lazy=True)

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    receiver_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    sender_account_number = db.Column(db.String(20), nullable=False)
    receiver_account_number = db.Column(db.String(20), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False, default = lambda: datetime.now(timezone.utc))
    current_balance = db.Column(db.Float, nullable=False)


class Wallet(db.Model):
    __tablename__ = 'wallets'
    id = db.Column(db.Integer, primary_key=True)
    bank = db.Column(db.String(50), nullable=False)
    account_number = db.Column(db.String(20), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    balance = db.Column(db.Float, nullable=False, default=0.0)