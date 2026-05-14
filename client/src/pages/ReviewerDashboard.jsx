import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import SummaryCard from '../components/SummaryCard';
import ReviewerProgressPanel from '../components/ReviewerProgressPanel';
import ReviewerActivityPanel from '../components/ReviewerActivityPanel';
import { evaluationService } from '../services/evaluationService';

function ReviewerDashboard() {
  const { user } = useAuth();
  const [myEvaluations, setMyEvaluations] = useState([]);
  const [stats, setStats] = useState({
    totalProposals: 0,
    reviewed: 0,
    pending: 0,
    accepted: 0,
    declined: 0,
    averageScore: 0,
    activeReviewers: 0,
    myCompleted: 0,
    myPending: 0,
    passmark: 30,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evalsData, statsData] = await Promise.all([
          evaluationService.getAll(),
          evaluationService.getStats(),
        ]);
        setMyEvaluations(evalsData);
        setStats(statsData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingReviews = myEvaluations.filter(e => e.status === 'pending');
  const completedReviews = myEvaluations.filter(e => e.status !== 'pending');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <SummaryCard title="Total Proposals" value={stats.totalProposals} color="blue" />
            <SummaryCard title="My Completed" value={stats.myCompleted} color="green" />
            <SummaryCard title="My Pending" value={stats.myPending} color="yellow" />
          </div>

          {/* Progress & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Reviewer Completion Progress</h2>
              <ReviewerProgressPanel />
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Reviewer Activity</h2>
              <ReviewerActivityPanel />
            </div>
          </div>

          {/* Pending Reviews */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Pending Reviews ({pendingReviews.length})</h2>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : pendingReviews.length === 0 ? (
              <p className="text-gray-500">No pending reviews.</p>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Proposal</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Submitter</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Institution</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingReviews.map(ev => (
                    <tr key={ev.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{ev.proposal_title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ev.submitter_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ev.institution}</td>
                      <td className="px-4 py-3">
                        <a href={`/proposal/${ev.proposal_id}`}
                          className="text-blue-600 hover:underline text-sm font-medium">Grade</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* My Completed Reviews */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">My Completed Reviews ({completedReviews.length})</h2>
            {completedReviews.length === 0 ? (
              <p className="text-gray-500">No completed reviews yet.</p>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Proposal</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Submitter</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">My Score</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">My Verdict</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Comments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {completedReviews.map(ev => (
                    <tr key={ev.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{ev.proposal_title}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ev.submitter_name}</td>
                      <td className="px-4 py-3 text-sm font-medium">{ev.total_score}/60</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          ev.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>{ev.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ev.comments || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewerDashboard;
