import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SummaryCard from '../components/SummaryCard';
import ProposalTable from '../components/ProposalTable';
import ProposalStatusChart from '../components/ProposalStatusChart';
import ReviewerActivityPanel from '../components/ReviewerActivityPanel';
import { proposalService } from '../services/proposalService';
import { evaluationService } from '../services/evaluationService';

function ReviewerDashboard() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [stats, setStats] = useState({
    totalProposals: 0,
    reviewed: 0,
    pending: 0,
    underReview: 0,
    averageScore: 0,
    activeReviewers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [proposalData, statsData] = await Promise.all([
          proposalService.getAll(),
          evaluationService.getStats(),
        ]);
        setProposals(proposalData);
        setStats(statsData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <SummaryCard title="Total Proposals" value={stats.totalProposals} color="blue" />
            <SummaryCard title="Reviewed" value={stats.reviewed} color="green" />
            <SummaryCard title="Pending" value={stats.pending} color="yellow" />
            <SummaryCard title="Under Review" value={stats.underReview} color="indigo" />
            <SummaryCard title="Avg Score" value={stats.averageScore} color="purple" />
            <SummaryCard title="Active Reviewers" value={stats.activeReviewers} color="teal" />
          </div>

          {/* Status Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Proposal Status Overview</h2>
              <ProposalStatusChart stats={stats} />
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Reviewer Activity</h2>
              <ReviewerActivityPanel />
            </div>
          </div>

          {/* Recent Proposals Table */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Proposals</h2>
            <ProposalTable proposals={proposals} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewerDashboard;
