import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#EAB308', '#22C55E', '#EF4444'];

function ProposalStatusChart({ stats }) {
  const data = [
    { name: 'Pending', value: stats.pending || 0 },
    { name: 'Accepted', value: stats.accepted || 0 },
    { name: 'Declined', value: stats.declined || 0 },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-8">No data to display yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default ProposalStatusChart;
