import React, { useState } from 'react';
import { evaluationService } from '../services/evaluationService';

const CRITERIA = [
  { key: 'originality', label: 'Originality' },
  { key: 'methodology', label: 'Methodology' },
  { key: 'feasibility', label: 'Feasibility' },
  { key: 'impact', label: 'Impact' },
  { key: 'clarity', label: 'Clarity' },
  { key: 'budget_justification', label: 'Budget Justification' },
];

function EvaluationForm({ proposalId, onSubmitted }) {
  const [scores, setScores] = useState(
    CRITERIA.reduce((acc, c) => ({ ...acc, [c.key]: 5 }), {})
  );
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const totalScore = Object.values(scores).reduce((sum, v) => sum + Number(v), 0);

  const handleScoreChange = (key, value) => {
    setScores({ ...scores, [key]: Math.min(10, Math.max(1, Number(value))) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await evaluationService.submit({
        proposal_id: proposalId,
        scores,
        comments,
      });
      setSuccess(true);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || 'Evaluation submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-100 text-green-700 p-4 rounded">
        Evaluation submitted successfully! Your score: <strong>{totalScore}/60</strong>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CRITERIA.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label} (1-10)</label>
            <input type="number" min={1} max={10} value={scores[key]}
              onChange={(e) => handleScoreChange(key, e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        ))}
      </div>

      <div className="flex gap-6 text-sm font-medium p-3 rounded bg-blue-50 text-blue-700">
        <span>Total Score: <strong>{totalScore}/60</strong></span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
        <textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={4}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the strengths and weaknesses of this proposal..." />
      </div>

      <button type="submit" disabled={submitting}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50">
        {submitting ? 'Submitting...' : 'Submit Grade'}
      </button>
    </form>
  );
}

export default EvaluationForm;
