import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';
import { proposalService } from '../services/proposalService';

function SubmitterDashboard() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const data = await proposalService.getMyProposals();
        setProposals(data);
      } catch (err) {
        console.error('Failed to fetch proposals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Proposals</h1>
          <Link to="/submitter/submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
            Submit New Proposal
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : proposals.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No proposals yet. Submit your first proposal!
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Title</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Institution</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Submitted</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Reviews</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Avg Score</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {proposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link to={`/proposal/${proposal.id}`} className="text-blue-600 hover:underline">
                        {proposal.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{proposal.institution}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{new Date(proposal.submitted_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{proposal.reviews_completed}/{proposal.reviews_total}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {proposal.average_score !== null ? `${proposal.average_score}/60` : '—'}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={proposal.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubmitterDashboard;
