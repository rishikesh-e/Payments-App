from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime, timezone
from werkzeug.security import check_password_hash
from models import Wallet, Transaction
from extensions import db

transaction_bp = Blueprint('transaction', __name__)

@transaction_bp.route('/add-amount', methods=['POST'])
@login_required
def add_amount():
    data = request.get_json()
    account_number = data.get('account_number')
    amount = data.get('amount')
    upi = data.get('upi')

    if not account_number:
        return jsonify({'message': 'Account number required'}), 400

    if amount is None:
        return jsonify({'message': 'Amount must be provided'}), 400

    try:
        amount = float(amount)
    except ValueError:
        return jsonify({'message': 'Amount must be a valid number'}), 400

    if amount <= 0:
        return jsonify({'message': 'Amount must be positive'}), 400

    if not upi or not check_password_hash(current_user.upi, upi):
        return jsonify({'message': 'Invalid UPI PIN'}), 400

    wallet = Wallet.query.filter_by(account_number=account_number, user_id=current_user.id).first()
    if not wallet:
        return jsonify({'message': 'Wallet with this account number not found or does not belong to you'}), 404

    wallet.balance += amount
    db.session.add(wallet)

    transaction = Transaction(
        sender_id=None,
        receiver_id=wallet.user_id,
        sender_account_number=None,
        receiver_account_number=account_number,
        amount=amount,
        date=datetime.now(timezone.utc),
        current_balance=wallet.balance
    )

    db.session.add(transaction)
    db.session.commit()

    return jsonify({
        'message': 'Amount added successfully',
        'new_balance': wallet.balance
    }), 200


@transaction_bp.route('/transfer', methods=['POST'])
@login_required
def transfer():
    user = current_user
    data = request.get_json()
    from_account = data.get('from_account')
    to_account = data.get('to_account')
    amount = data.get('amount')
    upi = data.get('upi')

    if not all([from_account, to_account, amount, upi]):
        return jsonify({'message': 'From account, to account, amount, and UPI PIN are required'}), 400

    if from_account == to_account:
        return jsonify({'message': 'Cannot transfer to the same account'}), 400

    try:
        amount = float(amount)
        if amount <= 0:
            return jsonify({'message': 'Amount must be positive'}), 400
    except ValueError:
        return jsonify({'message': 'Amount must be a valid number'}), 400

    if not check_password_hash(user.upi, upi):
        return jsonify({'message': 'Invalid UPI PIN'}), 400

    sender_wallet = Wallet.query.filter_by(account_number=from_account, user_id=user.id).first()
    if not sender_wallet:
        return jsonify({'message': 'Sender wallet not found or does not belong to you'}), 404

    recipient_wallet = Wallet.query.filter_by(account_number=to_account).first()
    if not recipient_wallet:
        return jsonify({'message': 'Recipient account not found'}), 404

    if sender_wallet.balance < amount:
        return jsonify({'message': 'Insufficient balance'}), 400

    sender_wallet.balance -= amount
    recipient_wallet.balance += amount
    db.session.add(sender_wallet)
    db.session.add(recipient_wallet)

    sender_txn = Transaction(
        sender_id=user.id,
        receiver_id=recipient_wallet.user_id,
        sender_account_number=from_account,
        receiver_account_number=to_account,
        amount=-amount,
        date=datetime.now(timezone.utc),
        current_balance=sender_wallet.balance,
    )

    receiver_txn = Transaction(
        sender_id=user.id,
        receiver_id=recipient_wallet.user_id,
        sender_account_number=from_account,
        receiver_account_number=to_account,
        amount=amount,
        date=datetime.now(timezone.utc),
        current_balance=recipient_wallet.balance,
    )

    db.session.add(sender_txn)
    db.session.add(receiver_txn)
    db.session.commit()

    return jsonify({'message': 'Transfer successful'}), 200

