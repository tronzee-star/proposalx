import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function ReviewerProgressPanel({ showAll = false }) {
  const { user } = useAuth();
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await api.get('/reviewers/activity');
        setReviewers(response.data);
      } catch (err) {
        console.error('Failed to fetch reviewer progress:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const visible = showAll ? reviewers : reviewers.filter(r => r.id === user?.id);

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (visible.length === 0) {
    return <p className="text-sm text-gray-500">No progress data yet.</p>;
  }

  return (
    <div className="space-y-5">
      {visible.map((r) => {
        const pct = r.progress_percent || 0;
        return (
          <div key={r.id}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-gray-700">{r.name}</span>
              <span className="text-xs text-gray-500">
                {r.completed_reviews}/{r.total_assigned} reviews · <span className="font-semibold text-green-600">{pct}%</span>
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, boxShadow: pct > 0 ? '0 0 8px rgba(34,197,94,0.5)' : 'none' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ReviewerProgressPanel;
