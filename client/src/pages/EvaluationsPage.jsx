import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { evaluationService } from '../services/evaluationService';

function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ institution: '', category: '' });

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const data = await evaluationService.getAll(filter);
        setEvaluations(data);
      } catch (err) {
        console.error('Failed to fetch evaluations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluations();
  }, [filter]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Evaluations</h1>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Submitter</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Phone</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Institution</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Proposal</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Score</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : evaluations.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No evaluations found.</td></tr>
                ) : (
                  evaluations.map((ev) => (
                    <tr key={ev.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{ev.submitter_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ev.phone}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ev.institution}</td>
                      <td className="px-4 py-3 text-sm text-blue-600">{ev.proposal_title}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{ev.score ?? '—'}</td>
                      <td className="px-4 py-3"><StatusBadge status={ev.status} /></td>
                      <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-xs">{ev.comments || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EvaluationsPage;
