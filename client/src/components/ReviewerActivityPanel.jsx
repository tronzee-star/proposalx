import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ReviewerActivityPanel() {
  const [reviewers, setReviewers] = useState([]);

  useEffect(() => {
    const fetchReviewers = async () => {
      try {
        const response = await api.get('/reviewers/activity');
        setReviewers(response.data);
      } catch (err) {
        console.error('Failed to fetch reviewer activity:', err);
      }
    };
    fetchReviewers();
  }, []);

  if (reviewers.length === 0) {
    return <p className="text-sm text-gray-500">No reviewer activity yet.</p>;
  }

  return (
    <div className="space-y-3">
      {reviewers.map((r) => (
        <div key={r.id} className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
            {r.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">{r.name}</p>
            <p className="text-xs text-gray-400">{r.completed_reviews} reviews completed</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ReviewerActivityPanel;
