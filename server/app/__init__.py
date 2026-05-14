from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

REVIEWERS = [
    {'name': 'Dr. Mary', 'email': 'mary@proposalx.com', 'password': '1234567'},
    {'name': 'Dr. James', 'email': 'james@proposalx.com', 'password': '1234567'},
    {'name': 'Dr. Ogaro', 'email': 'ogaro@proposalx.com', 'password': '1234567'},
    {'name': 'Dr. Jackline', 'email': 'jackline@proposalx.com', 'password': '1234567'},
    {'name': 'Dr. Purity', 'email': 'purity@proposalx.com', 'password': '1234567'},
]

ADMIN = {'name': 'Admin', 'email': 'admin@gmail.com', 'password': '1234567'}

def seed_users():
    from app.models.user import User
    for r in REVIEWERS:
        existing = User.query.filter_by(email=r['email']).first()
        if not existing:
            user = User(name=r['name'], email=r['email'], role='reviewer')
            user.set_password(r['password'])
            db.session.add(user)
    if not User.query.filter_by(email=ADMIN['email']).first():
        admin = User(name=ADMIN['name'], email=ADMIN['email'], role='admin')
        admin.set_password(ADMIN['password'])
        db.session.add(admin)
    db.session.commit()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')
    CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "*", "allow_headers": ["Content-Type", "Authorization"]}})
    db.init_app(app)

    from app.routes.auth_routes import auth_bp
    from app.routes.proposal_routes import proposal_bp
    from app.routes.evaluation_routes import evaluation_bp
    from app.routes.reviewer_routes import reviewer_bp
    from app.routes.admin_routes import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(proposal_bp, url_prefix='/api/proposals')
    app.register_blueprint(evaluation_bp, url_prefix='/api/evaluations')
    app.register_blueprint(reviewer_bp, url_prefix='/api/reviewers')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    with app.app_context():
        db.create_all()
        seed_users()

    return app
