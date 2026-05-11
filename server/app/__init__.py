from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')
    CORS(app)
    db.init_app(app)

    from app.routes.auth_routes import auth_bp
    from app.routes.proposal_routes import proposal_bp
    from app.routes.evaluation_routes import evaluation_bp
    from app.routes.reviewer_routes import reviewer_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(proposal_bp, url_prefix='/api/proposals')
    app.register_blueprint(evaluation_bp, url_prefix='/api/evaluations')
    app.register_blueprint(reviewer_bp, url_prefix='/api/reviewers')

    with app.app_context():
        db.create_all()

    return app
