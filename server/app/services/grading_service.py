def calculate_total_score(scores):
    """Calculate total score from individual criteria scores."""
    return sum(scores.values())

def calculate_average_score(scores):
    """Calculate average score from individual criteria scores."""
    if not scores:
        return 0.0
    return round(sum(scores.values()) / len(scores), 1)

def determine_status(recommendation):
    """Map recommendation to proposal status."""
    status_map = {
        'approve': 'approved',
        'revision': 'revision',
        'reject': 'rejected',
    }
    return status_map.get(recommendation, 'pending')
