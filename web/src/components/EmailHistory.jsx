import { useState, useEffect } from 'react';
import { Mail, Trash2 } from 'lucide-react';
import apiClient from '../services/apiClient';
import Pagination from './Pagination';
import SearchFilter from './SearchFilter';
import ErrorMessage from './ErrorMessage';
import { SkeletonItem } from './SkeletonLoader';

const PAGE_SIZE = 10;

export default function EmailHistory({ authToken }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, riskFilter]);

  useEffect(() => {
    fetchEmails();
  }, [currentPage, searchQuery, riskFilter, authToken]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      const offset = (currentPage - 1) * PAGE_SIZE;
      const params = new URLSearchParams();
      params.append('limit', PAGE_SIZE);
      params.append('offset', offset);
      if (searchQuery) params.append('search', searchQuery);
      if (riskFilter) params.append('riskLevel', riskFilter);

      const data = await apiClient.get(
        `/api/email/history?${params.toString()}`
      );
      setEmails(data.emails || []);
      setTotalItems(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch email history:', err);
      setError(err);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (emailId) => {
    if (!window.confirm('Delete this email record?')) return;

    setDeleting(emailId);
    try {
      await apiClient.delete(`/api/email/${emailId}`);
      setEmails(emails.filter(e => e.id !== emailId));
    } catch (error) {
      console.error('Failed to delete email:', error);
      alert(error.message || 'Failed to delete email');
    } finally {
      setDeleting(null);
    }
  };

  const getRiskColor = (score) => {
    if (score > 85) return 'text-red-400';
    if (score > 70) return 'text-orange-400';
    return 'text-green-400';
  };

  const getRiskBgColor = (score) => {
    if (score > 85) return 'bg-red-500/10 border-red-500/20';
    if (score > 70) return 'bg-orange-500/10 border-orange-500/20';
    return 'bg-green-500/10 border-green-500/20';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-475569">Loading emails...</div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Email History</h2>
        <p className="text-475569">{totalItems} emails analyzed</p>
      </div>

      {error && (
        <ErrorMessage
          error={error}
          onRetry={fetchEmails}
          onDismiss={() => setError(null)}
          title="Failed to load emails"
        />
      )}

      <SearchFilter
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by sender or subject..."
        onClear={() => {
          setSearchQuery('');
          setRiskFilter('');
        }}
        loading={loading}
        riskFilter={riskFilter}
        onRiskFilterChange={setRiskFilter}
      />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonItem key={i} />
          ))}
        </div>
      ) : emails.length === 0 ? (
        <div className="bg-white/50 border border-e2e8f0 rounded-lg p-8 text-center">
          <Mail className="w-12 h-12 text-94a3b8 mx-auto mb-4" />
          <p className="text-475569">No emails analyzed yet. Connect Gmail or analyze emails manually.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {emails.map((email) => (
              <div
                key={email.id}
                className={`border rounded-lg p-4 ${getRiskBgColor(email.scamScore)} border`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{email.sender}</p>
                    <p className="text-475569 text-sm truncate">{email.subject}</p>
                    <p className="text-475569 text-xs mt-1">
                      {new Date(email.createdAt).toLocaleDateString()} at{' '}
                      {new Date(email.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getRiskColor(email.scamScore)}`}>
                        {email.scamScore}%
                      </p>
                      <p className="text-xs text-475569">
                        {email.scamScore > 85
                          ? 'Critical'
                          : email.scamScore > 70
                          ? 'High'
                          : 'Low'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(email.id)}
                      disabled={deleting === email.id}
                      className="p-2 hover:bg-f1f5f9 rounded-lg transition disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-475569 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            loading={loading}
          />
        </>
      )}
    </div>
  );
}
