from app import db

class Proposal(db.Model):
    __tablename__ = 'proposals'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    institution = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    contact = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    file_path = db.Column(db.String(500), nullable=True)
    status = db.Column(db.String(50), default='pending')  # pending, accepted, declined
    submitter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    submitted_at = db.Column(db.DateTime, server_default=db.func.now())

    evaluations = db.relationship('Evaluation', backref='proposal', lazy=True)

    def get_completed_evaluations(self):
        return [e for e in self.evaluations if e.status != 'pending']

    def get_average_score(self):
        completed = self.get_completed_evaluations()
        if not completed:
            return None
        return round(sum(e.total_score for e in completed) / len(completed), 1)

    def get_reviews_completed(self):
        return len(self.get_completed_evaluations())

    def to_dict(self):
        avg_score = self.get_average_score()
        completed = self.get_reviews_completed()
        return {
            'id': self.id,
            'title': self.title,
            'institution': self.institution,
            'category': self.category,
            'contact': self.contact,
            'description': self.description,
            'file_url': f'/api/proposals/{self.id}/file' if self.file_path else None,
            'status': self.status,
            'submitter_id': self.submitter_id,
            'submitter_name': self.submitter.name if self.submitter else None,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'average_score': avg_score,
            'reviews_completed': completed,
            'reviews_total': 4,
        }
