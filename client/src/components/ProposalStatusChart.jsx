import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
  pending: '#EAB308',
  'under review': '#3B82F6',
  approved: '#22C55E',
  rejected: '#EF4444',
};

function ProposalStatusChart({ stats }) {
  const data = [
    { name: 'Pending', value: stats.pending || 0 },
    { name: 'Under Review', value: stats.underReview || 0 },
    { name: 'Approved', value: stats.reviewed || 0 },
    { name: 'Rejected', value: stats.rejected || 0 },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-8">No data to display yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
          {data.map((entry, index) => (
            <Cell key={index} fill={Object.values(COLORS)[index % Object.values(COLORS).length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default ProposalStatusChart;
