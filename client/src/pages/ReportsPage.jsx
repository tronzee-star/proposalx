import React from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

function ReportsPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Reports</h1>
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Reports feature coming soon.
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
