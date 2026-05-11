import json
from app import db

class Evaluation(db.Model):
    __tablename__ = 'evaluations'

    id = db.Column(db.Integer, primary_key=True)
    proposal_id = db.Column(db.Integer, db.ForeignKey('proposals.id'), nullable=False, unique=True)
    reviewer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    scores_json = db.Column(db.Text, nullable=False)  # JSON string of individual criteria scores
    total_score = db.Column(db.Float, nullable=False)
    average_score = db.Column(db.Float, nullable=False)
    comments = db.Column(db.Text, nullable=True)
    recommendation = db.Column(db.String(50), nullable=False)  # approve, revision, reject
    evaluated_at = db.Column(db.DateTime, server_default=db.func.now())

    reviewer = db.relationship('User', backref='evaluations')

    @property
    def scores(self):
        return json.loads(self.scores_json) if self.scores_json else {}

    @scores.setter
    def scores(self, value):
        self.scores_json = json.dumps(value)

    def to_dict(self):
        return {
            'id': self.id,
            'proposal_id': self.proposal_id,
            'reviewer_id': self.reviewer_id,
            'scores': self.scores,
            'total_score': self.total_score,
            'average_score': self.average_score,
            'comments': self.comments,
            'recommendation': self.recommendation,
            'evaluated_at': self.evaluated_at.isoformat() if self.evaluated_at else None,
        }
