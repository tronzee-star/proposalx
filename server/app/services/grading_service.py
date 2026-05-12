PASS_MARK = 30  # Half of max score (6 criteria × 10 = 60)
MAX_SCORE = 60
NUM_CRITERIA = 6

CRITERIA = [
    'Originality',
    'Methodology',
    'Feasibility',
    'Impact',
    'Clarity',
    'Budget Justification',
]

def calculate_total_score(scores):
    """Calculate total score from individual criteria scores."""
    return sum(scores.values())

def determine_status_by_score(total_score):
    """Determine accepted/declined based on pass mark."""
    return 'accepted' if total_score >= PASS_MARK else 'declined'

def determine_overall_status(evaluations):
    """Determine proposal status from all 4 reviewer evaluations."""
    completed = [e for e in evaluations if e.status != 'pending']
    if len(completed) < 4:
        return 'pending'
    avg = sum(e.total_score for e in completed) / len(completed)
    return 'accepted' if avg >= PASS_MARK else 'declined'
