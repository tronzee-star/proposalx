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

  useEffect(() => {
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
    fetchProposal();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!proposal) return <div className="flex items-center justify-center h-screen">Proposal not found.</div>;

  const isReviewer = user?.role === 'reviewer';

  return (
    <div className={`flex min-h-screen bg-gray-50 ${isReviewer ? '' : ''}`}>
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
              <p><span className="font-medium">Submitted:</span> {proposal.submitted_at}</p>
              <p><span className="font-medium">Reviewer:</span> {proposal.reviewer || 'Not assigned'}</p>
            </div>
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

          {/* Evaluation section for reviewers */}
          {isReviewer && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Evaluation</h2>
              <EvaluationForm proposalId={proposal.id} existingEvaluation={proposal.evaluation} />
            </div>
          )}

          {/* Feedback section for submitters */}
          {!isReviewer && proposal.evaluation && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Reviewer Feedback</h2>
              <p className="text-sm text-gray-600 mb-2"><span className="font-medium">Grade:</span> {proposal.evaluation.total_score}</p>
              <p className="text-sm text-gray-600"><span className="font-medium">Comments:</span> {proposal.evaluation.comments}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProposalDetailPage;
