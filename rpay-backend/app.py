from flask_cors import CORS
from flask import Flask
from flask_login import LoginManager
from extensions import mail
from auth import auth_bp
from config import Config
from models import db, User
from services import services_bp
from transactions import transaction_bp

app = Flask(__name__)
app.config.from_object(Config)
mail.init_app(app)
db.init_app(app)
CORS(app, supports_credentials=True)

login_manager=LoginManager()
login_manager.init_app(app)
@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

app.register_blueprint(auth_bp)
app.register_blueprint(transaction_bp)
app.register_blueprint(services_bp)

with app.app_context():
    db.create_all()

if __name__ == '_main_':
    app.run(debug=True)