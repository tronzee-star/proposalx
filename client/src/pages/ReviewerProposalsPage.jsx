import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ProposalTable from '../components/ProposalTable';
import { proposalService } from '../services/proposalService';

function ReviewerProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const data = await proposalService.getAll();
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">All Proposals</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <ProposalTable proposals={proposals} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewerProposalsPage;
