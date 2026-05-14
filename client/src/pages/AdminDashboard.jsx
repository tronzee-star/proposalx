import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { Users, FileText, Trash2, Shield, LogOut } from 'lucide-react';

function AdminDashboard() {
  const { logout } = useAuth();
  const [tab, setTab] = useState('users');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsData, usersData, proposalsData] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getProposals(),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setProposals(proposalsData);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This will also delete their proposals and evaluations.`)) return;
    try {
      await adminService.deleteUser(userId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteProposal = async (proposalId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This will also delete all its evaluations.`)) return;
    try {
      await adminService.deleteProposal(proposalId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete proposal');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
        <div className="px-6 py-5 border-b border-gray-700">
          <h1 className="text-xl font-bold">ProposalX</h1>
          <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          <button onClick={() => setTab('users')}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full transition ${
              tab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}>
            <Users size={18} /> Manage Users
          </button>
          <button onClick={() => setTab('proposals')}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full transition ${
              tab === 'proposals' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}>
            <FileText size={18} /> Manage Proposals
          </button>
        </nav>
        <div className="px-4 py-4 border-t border-gray-700">
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-800 hover:text-white w-full transition">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Shield size={22} className="text-blue-600" /> Admin Dashboard
          </h1>
        </div>

        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalUsers || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <p className="text-sm text-gray-500">Submitters</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalSubmitters || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
              <p className="text-sm text-gray-500">Reviewers</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalReviewers || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
              <p className="text-sm text-gray-500">Total Proposals</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalProposals || 0}</p>
            </div>
          </div>

          {/* Users Tab */}
          {tab === 'users' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-700">All Users ({users.length})</h2>
              </div>
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">ID</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Email</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Role</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Joined</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">{u.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">{u.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          u.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                          u.role === 'reviewer' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {u.role !== 'admin' ? (
                          <button onClick={() => handleDeleteUser(u.id, u.name)}
                            className="text-red-600 hover:text-red-800 transition flex items-center gap-1 text-sm">
                            <Trash2 size={14} /> Delete
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">Protected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Proposals Tab */}
          {tab === 'proposals' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-700">All Proposals ({proposals.length})</h2>
              </div>
              {proposals.length === 0 ? (
                <p className="px-6 py-4 text-gray-500">No proposals yet.</p>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">ID</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Title</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Submitter</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Institution</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Submitted</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {proposals.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500">{p.id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-700">{p.title}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{p.submitter_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{p.institution}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            p.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            p.status === 'declined' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>{p.status}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(p.submitted_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleDeleteProposal(p.id, p.title)}
                            className="text-red-600 hover:text-red-800 transition flex items-center gap-1 text-sm">
                            <Trash2 size={14} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
