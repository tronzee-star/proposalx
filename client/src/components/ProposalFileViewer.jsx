import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Download, FileText } from 'lucide-react';

function ProposalFileViewer({ proposalId, fileName }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const ext = fileName ? fileName.split('.').pop().toLowerCase() : '';

  useEffect(() => {
    let revokeUrl;
    const fetchFile = async () => {
      try {
        const response = await api.get(`/proposals/${proposalId}/file`, { responseType: 'blob' });
        const url = URL.createObjectURL(response.data);
        revokeUrl = url;
        setBlobUrl(url);
      } catch (err) {
        setError('Failed to load file');
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
    return () => { if (revokeUrl) URL.revokeObjectURL(revokeUrl); };
  }, [proposalId]);

  if (loading) return <p className="text-sm text-gray-500">Loading document...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  if (ext === 'pdf') {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <FileText size={14} /> {fileName}
          </span>
          <a href={blobUrl} download={fileName}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            <Download size={12} /> Download
          </a>
        </div>
        <iframe src={blobUrl} title={fileName} className="w-full h-[600px] border border-gray-300 rounded" />
      </div>
    );
  }

  // DOCX or other - browsers can't render natively
  return (
    <div className="border border-gray-200 rounded-lg p-6 text-center bg-gray-50">
      <FileText size={40} className="mx-auto text-gray-400 mb-2" />
      <p className="text-sm font-medium text-gray-700 mb-1">{fileName}</p>
      <p className="text-xs text-gray-500 mb-4">This document type cannot be previewed in the browser.</p>
      <a href={blobUrl} download={fileName}
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition">
        <Download size={16} /> Download Document
      </a>
    </div>
  );
}

export default ProposalFileViewer;
