import React from 'react';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  'under review': 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  revision: 'bg-orange-100 text-orange-800',
};

function StatusBadge({ status }) {
  const normalized = status?.toLowerCase() || 'pending';
  const style = STATUS_STYLES[normalized] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${style}`}>
      {normalized}
    </span>
  );
}

export default StatusBadge;
