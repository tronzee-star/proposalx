import React, { useState } from 'react';
import { evaluationService } from '../services/evaluationService';

const CRITERIA = [
  { key: 'originality', label: 'Originality' },
  { key: 'feasibility', label: 'Feasibility' },
  { key: 'innovation', label: 'Innovation' },
  { key: 'impact', label: 'Impact' },
  { key: 'sustainability', label: 'Sustainability' },
  { key: 'documentation', label: 'Documentation Quality' },
];

function EvaluationForm({ proposalId, existingEvaluation = null }) {
  const [scores, setScores] = useState(
    existingEvaluation?.scores || CRITERIA.reduce((acc, c) => ({ ...acc, [c.key]: 5 }), {})
  );
  const [comments, setComments] = useState(existingEvaluation?.comments || '');
  const [recommendation, setRecommendation] = useState(existingEvaluation?.recommendation || '');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const totalScore = Object.values(scores).reduce((sum, v) => sum + Number(v), 0);
  const averageScore = (totalScore / CRITERIA.length).toFixed(1);

  const handleScoreChange = (key, value) => {
    setScores({ ...scores, [key]: Math.min(10, Math.max(1, Number(value))) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await evaluationService.submit({
        proposal_id: proposalId,
        scores,
        comments,
        recommendation,
        total_score: totalScore,
        average_score: parseFloat(averageScore),
      });
      setSuccess(true);
    } catch (err) {
      console.error('Evaluation submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && <div className="bg-green-100 text-green-700 p-3 rounded">Evaluation submitted successfully!</div>}

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

      <div className="flex gap-6 text-sm font-medium text-gray-700 bg-gray-50 p-3 rounded">
        <span>Total Score: <strong>{totalScore}/{CRITERIA.length * 10}</strong></span>
        <span>Average: <strong>{averageScore}/10</strong></span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Comments & Recommendations</label>
        <textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={4}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the strengths and weaknesses of this proposal..." />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Final Recommendation</label>
        <select value={recommendation} onChange={(e) => setRecommendation(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
          <option value="">Select recommendation</option>
          <option value="approve">Approve</option>
          <option value="revision">Revision Required</option>
          <option value="reject">Reject</option>
        </select>
      </div>

      <button type="submit" disabled={submitting}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50">
        {submitting ? 'Submitting...' : 'Submit Evaluation'}
      </button>
    </form>
  );
}

export default EvaluationForm;
