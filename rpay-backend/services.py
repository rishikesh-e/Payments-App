from flask_mail import Message
from werkzeug.security import check_password_hash

from extensions import mail, db
from flask import jsonify, Blueprint, request, make_response, render_template_string
from flask_login import login_required, current_user
from io import BytesIO
from xhtml2pdf import pisa
from datetime import datetime
from models import Transaction, User, Wallet

services_bp = Blueprint('services_bp', __name__)


def send_otp_email(user, otp):
    msg = Message(
        'Password reset request',
        sender='rishikesh220707@gmail.com',
        recipients=[user.email]
    )
    msg.body = f"""
    Hi {user.name},

    We received a request to reset your password.
    Your One-Time Password (OTP) is: {otp}

    This OTP is valid for 5 minutes. Please do not share it with anyone.
    If you did not request this, please ignore this email.

    Regards,
    RPay
    """
    try:
        mail.send(msg)
        return jsonify({"message": "OTP sent successfully"}), 200
    except Exception as e:
        return jsonify({"message": f"Failed to send email: {str(e)}"}), 500


@services_bp.route('/profile', methods=['GET'])
@login_required
def get_profile():
    user = current_user
    data = {
        'name': user.name,
        'user_id': user.id,
        'email': user.email,
        'accounts_count': len(user.wallets),
        'transactions_count': Transaction.query.filter(
            (Transaction.sender_id == user.id) | (Transaction.receiver_id == user.id)
        ).count()
    }
    return jsonify(data), 200


@services_bp.route('/get-wallets', methods=['GET'])
@login_required
def get_wallets():
    wallets = Wallet.query.filter_by(user_id=current_user.id).all()
    wallet_list = [
        {
            'account_number': wallet.account_number
        }
        for wallet in wallets
    ]
    return jsonify({'accounts': wallet_list}), 200

@services_bp.route('/get-balance', methods=['GET'])
def get_balance():
    account_number = request.args.get('account_number')
    upi_pin = request.args.get('upi')

    if not account_number or not upi_pin:
        return jsonify({"error": "Missing account_number or upi (PIN) parameter"}), 400

    wallet = Wallet.query.filter_by(account_number=account_number).first()
    if not wallet:
        return jsonify({"error": "Wallet with given account number not found"}), 404

    user = User.query.get(wallet.user_id)
    if not user:
        return jsonify({"error": "User associated with wallet not found"}), 404

    if not check_password_hash(user.upi, upi_pin):
        return jsonify({"error": "Invalid UPI PIN"}), 403

    return jsonify({
        "account_number": wallet.account_number,
        "balance": wallet.balance
    }), 200


@services_bp.route('/add-wallet', methods=['POST'])
@login_required
def add_wallet():
    data = request.get_json()
    bank = data.get('bank')
    account_number = data.get('account_number')

    if not bank or not account_number:
        return jsonify({'message': 'Bank name and account number are required'}), 400

    existing_wallet = Wallet.query.filter_by(user_id=current_user.id, bank=bank).first()
    if existing_wallet:
        return jsonify({'message': 'Wallet with this bank already exists'}), 400
    if Wallet.query.filter_by(account_number=account_number).first():
        return jsonify({'message': 'Account number already in use'}), 400

    new_wallet = Wallet(
        bank=bank,
        user_id=current_user.id,
        balance=0.0,
        account_number=account_number
    )
    db.session.add(new_wallet)
    db.session.commit()

    return jsonify({
        'message': f'Wallet for {bank} added successfully.',
        'wallet': {
            'id': new_wallet.id,
            'bank': new_wallet.bank,
            'account_number': new_wallet.account_number,
            'balance': new_wallet.balance
        }
    }), 201


@services_bp.route('/get-transactions', methods=['GET'])
@login_required
def get_transactions():
    upi = request.args.get('upi_pin')
    if not upi or not check_password_hash(current_user.upi, upi):
        return jsonify({'message': 'Invalid or missing UPI PIN'}), 401

    user = current_user
    transactions = Transaction.query.filter(
        (Transaction.sender_id == user.id) | (Transaction.receiver_id == user.id)
    ).order_by(Transaction.date.desc()).all()

    result = []
    user_account = user.wallets[0].account_number if user.wallets else 'N/A'

    for txn in transactions:
        # Skip mirrored transactions
        if txn.sender_id == user.id and txn.amount > 0:
            continue
        if txn.receiver_id == user.id and txn.amount < 0:
            continue

        if txn.sender_id is None:
            txn_type = 'deposit'
        elif txn.receiver_id == user.id:
            txn_type = 'credit'
        else:
            txn_type = 'debit'

        transaction_data = {
            'id': txn.id,
            'type': txn_type,
            'amount': abs(txn.amount),
            'date': txn.date.isoformat(),
            'current_balance': txn.current_balance,
            'account_number': user_account
        }

        if txn_type == 'deposit':
            transaction_data.update({
                'receiver_account_number': txn.receiver_account_number or user_account,
                'description': 'Cash Deposit'
            })
        elif txn_type == 'credit':
            sender = User.query.get(txn.sender_id)
            transaction_data.update({
                'sender_account_number': txn.sender_account_number or 'N/A',
                'sender_name': sender.name if sender else 'N/A',
                'description': f'Transfer from {sender.name if sender else "Unknown"}'
            })
        else:  # debit
            receiver = User.query.get(txn.receiver_id)
            transaction_data.update({
                'receiver_account_number': txn.receiver_account_number or 'N/A',
                'receiver_name': receiver.name if receiver else 'N/A',
                'description': f'Transfer to {receiver.name if receiver else "Unknown"}'
            })

        result.append(transaction_data)

    return jsonify(result), 200


@services_bp.route('/download-transactions', methods=['GET'])
@login_required
def download_transactions():
    upi = request.args.get('upi')
    if not upi or not check_password_hash(current_user.upi, upi):
        return jsonify({'message': 'Invalid or missing UPI PIN'}), 401

    user = current_user
    transactions = Transaction.query.filter(
        (Transaction.sender_id == user.id) | (Transaction.receiver_id == user.id)
    ).order_by(Transaction.date.desc(), Transaction.id.desc()).all()

    data = []
    user_account = user.wallets[0].account_number if user.wallets else 'N/A'

    for txn in transactions:
        # Skip mirrored transactions
        if txn.sender_id == user.id and txn.amount > 0:
            continue
        if txn.receiver_id == user.id and txn.amount < 0:
            continue

        if txn.sender_id is None:
            txn_type = 'deposit'
        elif txn.receiver_id == user.id:
            txn_type = 'credit'
        else:
            txn_type = 'debit'

        sender = User.query.get(txn.sender_id) if txn.sender_id else None
        receiver = User.query.get(txn.receiver_id) if txn.receiver_id else None

        data.append({
            'id': txn.id,
            'sender_name': sender.name if sender else 'N/A',
            'sender_account': txn.sender_account_number or 'N/A',
            'receiver_name': receiver.name if receiver else 'N/A',
            'receiver_account': txn.receiver_account_number or 'N/A',
            'amount': abs(txn.amount),
            'type': txn_type,
            'date': txn.date.strftime('%Y-%m-%d %H:%M:%S'),
            'current_balance': txn.current_balance
        })

    html = render_template_string(''' 
        <h2 style="text-align: center;">Transaction History</h2>
        <table border="1" cellspacing="0" cellpadding="5" width="100%">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Sender Name</th>
                    <th>Sender Account</th>
                    <th>Receiver Name</th>
                    <th>Receiver Account</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Balance</th>
                </tr>
            </thead>
            <tbody>
            {% for txn in transactions %}
                <tr>
                    <td>{{ txn.id }}</td>
                    <td>{{ txn.sender_name }}</td>
                    <td>{{ txn.sender_account }}</td>
                    <td>{{ txn.receiver_name }}</td>
                    <td>{{ txn.receiver_account }}</td>
                    <td>{{ txn.type }}</td>
                    <td>{{ txn.amount }}</td>
                    <td>{{ txn.date }}</td>
                    <td>{{ txn.current_balance }}</td>
                </tr>
            {% endfor %}
            </tbody>
        </table>
    ''', transactions=data)

    result = BytesIO()
    pisa_status = pisa.CreatePDF(html, dest=result)

    if pisa_status.err:
        return "Error generating PDF", 500

    response = make_response(result.getvalue())
    response.headers["Content-Type"] = "application/pdf"
    response.headers["Content-Disposition"] = "attachment; filename=transaction_history.pdf"
    return response



@services_bp.route('/transactions/filter', methods=['POST'])
@login_required
def filter_transactions_by_date():
    data = request.get_json()
    upi = data.get('upi')
    if not upi or not check_password_hash(current_user.upi, upi):
        return jsonify({'message': 'Invalid or missing UPI PIN'}), 401

    start_date_str = data.get('start_date')
    end_date_str = data.get('end_date')

    if not start_date_str or not end_date_str:
        return jsonify({'message': 'Start date and end date are required'}), 400

    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
    except ValueError:
        return jsonify({'message': 'Invalid date format. Use YYYY-MM-DD'}), 400

    transactions = Transaction.query.filter(
        ((Transaction.sender_id == current_user.id) | (Transaction.receiver_id == current_user.id)),
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).order_by(Transaction.date.desc()).all()

    result = []
    for txn in transactions:
        if txn.sender_id is None:
            txn_type = 'deposit'
        elif current_user.id == txn.receiver_id and txn.amount > 0:
            txn_type = 'credit'
        else:
            txn_type = 'debit'

        sender = User.query.get(txn.sender_id) if txn.sender_id else None
        receiver = User.query.get(txn.receiver_id) if txn.receiver_id else None

        txn_data = {
            "id": txn.id,
            "amount": abs(txn.amount),
            "type": txn_type,
            "date": txn.date.strftime('%Y-%m-%d'),
            "balance": txn.current_balance,
            "sender_name": sender.name if sender else "N/A",
            "sender_account_number": txn.sender_account_number or "N/A",
            "receiver_name": receiver.name if receiver else "N/A",
            "receiver_account_number": txn.receiver_account_number or "N/A"
        }

        result.append(txn_data)

    return jsonify(result), 200

