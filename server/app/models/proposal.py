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
    status = db.Column(db.String(50), default='pending')  # pending, under review, approved, rejected, revision
    submitter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reviewer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    submitted_at = db.Column(db.DateTime, server_default=db.func.now())

    reviewer = db.relationship('User', foreign_keys=[reviewer_id], backref='assigned_proposals')
    evaluation = db.relationship('Evaluation', backref='proposal', uselist=False, lazy=True)

    def to_dict(self):
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
            'reviewer_id': self.reviewer_id,
            'reviewer': self.reviewer.name if self.reviewer else None,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'grade': self.evaluation.total_score if self.evaluation else None,
            'evaluation': self.evaluation.to_dict() if self.evaluation else None,
        }
