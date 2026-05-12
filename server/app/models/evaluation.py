import json
from app import db

PASS_MARK = 30  # Half of max score (6 criteria × 10 = 60)

class Evaluation(db.Model):
    __tablename__ = 'evaluations'

    id = db.Column(db.Integer, primary_key=True)
    proposal_id = db.Column(db.Integer, db.ForeignKey('proposals.id'), nullable=False)
    reviewer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    scores_json = db.Column(db.Text, nullable=True)  # JSON string of individual criteria scores
    total_score = db.Column(db.Float, nullable=True)
    comments = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='pending')  # pending, accepted, declined
    evaluated_at = db.Column(db.DateTime, nullable=True)

    __table_args__ = (db.UniqueConstraint('proposal_id', 'reviewer_id', name='uq_proposal_reviewer'),)

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
            'reviewer_name': self.reviewer.name if self.reviewer else None,
            'scores': self.scores,
            'total_score': self.total_score,
            'comments': self.comments,
            'status': self.status,
            'evaluated_at': self.evaluated_at.isoformat() if self.evaluated_at else None,
        }
