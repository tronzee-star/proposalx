import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import { Users, FileText, Trash2, Shield, LogOut, Upload, CheckSquare, Square, UserPlus, Trophy } from 'lucide-react';
import ReviewerProgressPanel from '../components/ReviewerProgressPanel';

function AdminDashboard() {
  const { logout } = useAuth();
  const [tab, setTab] = useState('upload');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload form state
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  // Add user form state
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'reviewer' });
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);

  const fetchData = async () => {
    try {
      const [statsData, usersData, proposalsData, reviewersData] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getProposals(),
        adminService.getReviewers(),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setProposals(proposalsData);
      setReviewers(reviewersData);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete ${userName}? This will remove their proposals and evaluations.`)) return;
    try { await adminService.deleteUser(userId); fetchData(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete user'); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserError(''); setUserSuccess('');
    setCreatingUser(true);
    try {
      await adminService.createUser(newUser);
      setUserSuccess(`User ${newUser.name} added.`);
      setNewUser({ name: '', email: '', password: '', role: 'reviewer' });
      fetchData();
    } catch (err) {
      setUserError(err.response?.data?.message || 'Failed to add user');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteProposal = async (proposalId, title) => {
    if (!window.confirm(`Delete "${title}"? This will remove all its evaluations.`)) return;
    try { await adminService.deleteProposal(proposalId); fetchData(); }
    catch (err) { alert(err.response?.data?.message || 'Failed to delete proposal'); }
  };

  const toggleReviewer = (id) => {
    setSelectedReviewers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError(''); setUploadSuccess('');

    if (selectedReviewers.length < 3) {
      setUploadError('Please select at least 3 reviewers.');
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append('title', title);
      data.append('reviewer_ids', selectedReviewers.join(','));
      if (file) data.append('file', file);

      await adminService.uploadProposal(data);
      setUploadSuccess('Proposal uploaded and allocated successfully.');
      setTitle('');
      setFile(null);
      setFileInputKey(k => k + 1);
      setSelectedReviewers([]);
      fetchData();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-gray-900 text-white h-screen sticky top-0 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-700">
          <h1 className="text-xl font-bold">ProposalX</h1>
          <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavBtn active={tab === 'upload'} onClick={() => setTab('upload')} icon={Upload} label="Upload Proposal" />
          <NavBtn active={tab === 'proposals'} onClick={() => setTab('proposals')} icon={FileText} label="Manage Proposals" />
          <NavBtn active={tab === 'rankings'} onClick={() => setTab('rankings')} icon={Trophy} label="Rankings" />
          <NavBtn active={tab === 'users'} onClick={() => setTab('users')} icon={Users} label="Manage Users" />
        </nav>
        <div className="px-4 py-4 border-t border-gray-700">
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-800 hover:text-white w-full transition">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Shield size={22} className="text-blue-600" /> Admin Dashboard
          </h1>
        </div>

        <div className="p-6">
          {tab === 'upload' && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard label="Total Users" value={stats.totalUsers || 0} color="blue" />
                <StatCard label="Reviewers" value={stats.totalReviewers || 0} color="purple" />
                <StatCard label="Total Proposals" value={stats.totalProposals || 0} color="yellow" />
                <StatCard label="Pending" value={stats.pendingProposals || 0} color="orange" />
              </div>

              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">All Reviewers Progress</h2>
                <ReviewerProgressPanel showAll />
              </div>
            </>
          )}

          {tab === 'upload' && (
            <div className="bg-white rounded-lg shadow p-6 max-w-3xl">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Upload New Proposal</h2>
              {uploadError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{uploadError}</div>}
              {uploadSuccess && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{uploadSuccess}</div>}

              <form onSubmit={handleUpload} className="space-y-4">
                <Input label="Proposal Title" value={title}
                  onChange={(v) => setTitle(v)} required />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Document (PDF/DOCX)</label>
                  <input key={fileInputKey} type="file" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files[0])}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allocate to Reviewers (select at least 3) — {selectedReviewers.length} selected
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {reviewers.map(r => {
                      const checked = selectedReviewers.includes(r.id);
                      return (
                        <button key={r.id} type="button" onClick={() => toggleReviewer(r.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition ${
                            checked ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400'
                          }`}>
                          {checked ? <CheckSquare size={16} /> : <Square size={16} />}
                          <span>{r.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button type="submit" disabled={uploading}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50">
                  {uploading ? 'Uploading...' : 'Upload & Allocate'}
                </button>
              </form>
            </div>
          )}

          {tab === 'users' && (
            <>
              <div className="bg-white rounded-lg shadow p-6 mb-6 max-w-3xl">
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <UserPlus size={20} /> Add New User
                </h2>
                {userError && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{userError}</div>}
                {userSuccess && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">{userSuccess}</div>}
                <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Full Name" value={newUser.name}
                    onChange={(v) => setNewUser({ ...newUser, name: v })} required />
                  <Input label="Email" value={newUser.email}
                    onChange={(v) => setNewUser({ ...newUser, email: v })} required />
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="reviewer">Reviewer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" disabled={creatingUser}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50">
                      {creatingUser ? 'Adding...' : 'Add User'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-700">All Users ({users.length})</h2>
                </div>
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <Th>ID</Th><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Joined</Th><Th>Action</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <Td>{u.id}</Td>
                      <Td className="font-medium text-gray-700">{u.name}</Td>
                      <Td>{u.email}</Td>
                      <Td>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          u.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                          u.role === 'reviewer' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>{u.role}</span>
                      </Td>
                      <Td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</Td>
                      <Td>
                        {u.role !== 'admin' ? (
                          <button onClick={() => handleDeleteUser(u.id, u.name)}
                            className="text-red-600 hover:text-red-800 transition flex items-center gap-1 text-sm">
                            <Trash2 size={14} /> Delete
                          </button>
                        ) : <span className="text-xs text-gray-400">Protected</span>}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}

          {tab === 'rankings' && (() => {
            const ranked = proposals
              .filter(p => p.reviews_total > 0 && p.reviews_completed === p.reviews_total)
              .sort((a, b) => (b.average_score || 0) - (a.average_score || 0));
            const incomplete = proposals.filter(p => p.reviews_total === 0 || p.reviews_completed < p.reviews_total);
            return (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                    <Trophy size={20} className="text-yellow-500" /> Proposal Rankings
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Showing only proposals where every allocated reviewer has submitted, sorted by average score.
                  </p>
                </div>
                {ranked.length === 0 ? (
                  <p className="px-6 py-4 text-gray-500 text-sm">
                    No fully-reviewed proposals yet. {incomplete.length > 0 && `${incomplete.length} proposal(s) still awaiting reviews.`}
                  </p>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-gray-100">
                      <tr>
                        <Th>Rank</Th><Th>Title</Th><Th>Reviews</Th><Th>Average Score</Th><Th>Submitted</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {ranked.map((p, i) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <Td className="font-bold">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs ${
                              i === 0 ? 'bg-yellow-400 text-white' :
                              i === 1 ? 'bg-gray-300 text-gray-800' :
                              i === 2 ? 'bg-orange-400 text-white' :
                              'bg-gray-100 text-gray-700'
                            }`}>{i + 1}</span>
                          </Td>
                          <Td className="font-medium text-gray-700">{p.title}</Td>
                          <Td>{p.reviews_completed}/{p.reviews_total}</Td>
                          <Td className="font-bold text-blue-700">{p.average_score}/60</Td>
                          <Td>{new Date(p.submitted_at).toLocaleDateString()}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {incomplete.length > 0 && (
                  <div className="px-6 py-4 border-t bg-yellow-50 text-sm text-yellow-800">
                    {incomplete.length} proposal(s) still awaiting all reviews — they will appear here once complete.
                  </div>
                )}
              </div>
            );
          })()}

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
                      <Th>ID</Th><Th>Title</Th><Th>Reviews</Th><Th>Avg Score</Th><Th>Submitted</Th><Th>Action</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {proposals.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <Td>{p.id}</Td>
                        <Td className="font-medium text-gray-700">{p.title}</Td>
                        <Td>{p.reviews_completed}/{p.reviews_total}</Td>
                        <Td className="font-medium">{p.average_score !== null ? `${p.average_score}/60` : '—'}</Td>
                        <Td>{new Date(p.submitted_at).toLocaleDateString()}</Td>
                        <Td>
                          <button onClick={() => handleDeleteProposal(p.id, p.title)}
                            className="text-red-600 hover:text-red-800 transition flex items-center gap-1 text-sm">
                            <Trash2 size={14} /> Delete
                          </button>
                        </Td>
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

function NavBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm w-full transition ${
        active ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
      }`}>
      <Icon size={18} /> {label}
    </button>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    blue: 'border-blue-500',
    purple: 'border-purple-500',
    yellow: 'border-yellow-500',
    orange: 'border-orange-500',
  };
  return (
    <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${colors[color]}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

function Input({ label, value, onChange, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );
}

function Th({ children }) {
  return <th className="px-4 py-3 text-sm font-medium text-gray-600">{children}</th>;
}

function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 text-sm text-gray-600 ${className}`}>{children}</td>;
}

export default AdminDashboard;
