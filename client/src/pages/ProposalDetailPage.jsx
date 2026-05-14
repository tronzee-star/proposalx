import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import EvaluationForm from '../components/EvaluationForm';
import ProposalFileViewer from '../components/ProposalFileViewer';
import { proposalService } from '../services/proposalService';
import { evaluationService } from '../services/evaluationService';
import { Link } from 'react-router-dom';

function ProposalDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingEvals, setPendingEvals] = useState([]);

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

  const fetchPending = async () => {
    try {
      const evals = await evaluationService.getAll();
      setPendingEvals(evals.filter(e => e.status === 'pending' && e.proposal_id !== Number(id)));
    } catch (err) {
      console.error('Failed to fetch pending evaluations:', err);
    }
  };

  useEffect(() => {
    fetchProposal();
    if (user?.role === 'reviewer') fetchPending();
  }, [id]);

  const handleSubmitted = () => {
    fetchProposal();
    fetchPending();
  };

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
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{proposal.title}</h1>
                <p className="text-xs text-gray-500 mt-1">
                  Submitted {new Date(proposal.submitted_at).toLocaleDateString()} · {proposal.reviews_completed}/{proposal.reviews_total} reviews completed
                </p>
              </div>
              <StatusBadge status={proposal.status} />
            </div>

            {proposal.average_score !== null && user?.role === 'admin' && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">
                  Average Score: <span className="text-lg font-bold">{proposal.average_score}/60</span>
                </p>
              </div>
            )}

            {proposal.description && (
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{proposal.description}</p>
              </div>
            )}

            {proposal.file_url ? (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Proposal Document</h3>
                <ProposalFileViewer proposalId={proposal.id} fileName={proposal.file_name} />
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No document attached.</p>
            )}
          </div>

          {/* Evaluation form for reviewers */}
          {isReviewer && myEval && myEval.status === 'pending' && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Grade This Proposal</h2>
              <EvaluationForm proposalId={proposal.id} onSubmitted={handleSubmitted} />
            </div>
          )}

          {/* Show reviewer's own completed evaluation */}
          {isReviewer && myEval && myEval.status !== 'pending' && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Evaluation</h2>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-sm font-medium text-gray-600">Your Score: {myEval.total_score}/60</span>
              </div>
              {myEval.comments && <p className="text-sm text-gray-600"><span className="font-medium">Comments:</span> {myEval.comments}</p>}
            </div>
          )}

          {/* Pending reviews list — visible to reviewers after they grade or while still pending */}
          {isReviewer && myEval && myEval.status !== 'pending' && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Your Pending Reviews ({pendingEvals.length})
              </h2>
              {pendingEvals.length === 0 ? (
                <p className="text-sm text-gray-500">You have no other pending reviews. Great job!</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {pendingEvals.map(ev => (
                    <li key={ev.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{ev.proposal_title}</p>
                        <p className="text-xs text-gray-500">{ev.submitter_name} · {ev.institution || '—'}</p>
                      </div>
                      <Link to={`/proposal/${ev.proposal_id}`}
                        className="text-blue-600 hover:underline text-sm font-medium">Grade</Link>
                    </li>
                  ))}
                </ul>
              )}
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
