import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import EvaluationForm from '../components/EvaluationForm';
import { proposalService } from '../services/proposalService';

function ProposalDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProposal = async () => {
    try {
      const data = await proposalService.getById(id);
      setProposal(data);
    } catch (err) {
      console.error('Failed to fetch proposal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposal();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!proposal) return <div className="flex items-center justify-center h-screen">Proposal not found.</div>;

  const isReviewer = user?.role === 'reviewer';
  const myEval = isReviewer && proposal.evaluations
    ? proposal.evaluations.find(e => e.reviewer_id === user.id)
    : null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {isReviewer && <Sidebar />}
      <div className="flex-1">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-gray-800">{proposal.title}</h1>
              <StatusBadge status={proposal.status} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
              <p><span className="font-medium">Institution:</span> {proposal.institution}</p>
              <p><span className="font-medium">Category:</span> {proposal.category}</p>
              <p><span className="font-medium">Submitted by:</span> {proposal.submitter_name}</p>
              <p><span className="font-medium">Contact:</span> {proposal.contact}</p>
              <p><span className="font-medium">Submitted:</span> {new Date(proposal.submitted_at).toLocaleDateString()}</p>
              <p><span className="font-medium">Reviews:</span> {proposal.reviews_completed}/{proposal.reviews_total} completed</p>
            </div>
            {proposal.average_score !== null && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">
                  Average Score: <span className="text-lg font-bold">{proposal.average_score}/60</span>
                  <span className="ml-2 text-xs">(Pass mark: 30/60)</span>
                </p>
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600">{proposal.description}</p>
            </div>
            {proposal.file_url && (
              <div className="mt-4">
                <a href={proposal.file_url} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm">Download Attached Document</a>
              </div>
            )}
          </div>

          {/* Evaluation form for reviewers */}
          {isReviewer && myEval && myEval.status === 'pending' && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Grade This Proposal</h2>
              <EvaluationForm proposalId={proposal.id} onSubmitted={fetchProposal} />
            </div>
          )}

          {/* Show reviewer's own completed evaluation */}
          {isReviewer && myEval && myEval.status !== 'pending' && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Evaluation</h2>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-sm font-medium text-gray-600">Your Score: {myEval.total_score}/60</span>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  myEval.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>{myEval.status}</span>
              </div>
              {myEval.comments && <p className="text-sm text-gray-600"><span className="font-medium">Comments:</span> {myEval.comments}</p>}
            </div>
          )}

          {/* Submitter: show all reviewer feedback */}
          {!isReviewer && proposal.evaluations && proposal.evaluations.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Reviewer Feedback</h2>
              <div className="space-y-4">
                {proposal.evaluations.map(ev => (
                  <div key={ev.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{ev.reviewer_name}</span>
                      {ev.status === 'pending' ? (
                        <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">Pending</span>
                      ) : (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          ev.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>{ev.status} — {ev.total_score}/60</span>
                      )}
                    </div>
                    {ev.comments && <p className="text-sm text-gray-500">{ev.comments}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProposalDetailPage;
