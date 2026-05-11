import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

function ProposalTable({ proposals = [], loading = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('submitted_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filtered = proposals
    .filter((p) =>
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.submitter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.institution?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[sortField] || '';
      const valB = b[sortField] || '';
      return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

  if (loading) return <p className="text-gray-500 text-center py-8">Loading proposals...</p>;

  return (
    <div>
      <input type="text" placeholder="Search by title, submitter, or institution..."
        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-full md:w-1/2 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              {['title', 'submitter_name', 'institution', 'category', 'reviewer', 'submitted_at', 'status'].map((col) => (
                <th key={col} onClick={() => handleSort(col)}
                  className="px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:text-gray-800 select-none capitalize">
                  {col.replace('_', ' ')} {sortField === col ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No proposals found.</td></tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <Link to={`/proposal/${p.id}`} className="text-blue-600 hover:underline">{p.title}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.submitter_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.institution}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.category}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.reviewer || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.submitted_at}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProposalTable;
