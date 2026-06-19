import { useState, useEffect } from 'react';
import { MessageCircle, Trash2 } from 'lucide-react';
import apiClient from '../services/apiClient';
import Pagination from './Pagination';

const PAGE_SIZE = 10;

export default function WhatsappHistory({ authToken }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchMessages();
  }, [currentPage, authToken]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * PAGE_SIZE;
      const data = await apiClient.get(
        `/api/whatsapp/history?limit=${PAGE_SIZE}&offset=${offset}`
      );
      setMessages(data.messages || []);
      setTotalItems(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch WhatsApp history:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm('Delete this message record?')) return;

    setDeleting(messageId);
    try {
      await apiClient.delete(`/api/whatsapp/${messageId}`);
      setMessages(messages.filter(m => m.id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert(error.message || 'Failed to delete message');
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

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">WhatsApp History</h2>
        <p className="text-475569">{totalItems} messages analyzed</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-475569">Loading messages...</div>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white/50 border border-e2e8f0 rounded-lg p-8 text-center">
          <MessageCircle className="w-12 h-12 text-94a3b8 mx-auto mb-4" />
          <p className="text-475569">No WhatsApp messages analyzed yet.</p>
          <p className="text-475569 text-sm mt-2">Install the browser extension to monitor messages in real-time.</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`border rounded-lg p-4 ${getRiskBgColor(message.scamScore)} border`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">💬 {message.sender}</p>
                    <p className="text-475569 text-sm truncate mt-1">{message.messageText}</p>
                    <p className="text-475569 text-xs mt-2">
                      {new Date(message.createdAt).toLocaleDateString()} at{' '}
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getRiskColor(message.scamScore)}`}>
                        {message.scamScore}%
                      </p>
                      <p className="text-xs text-475569">
                        {message.scamScore > 85
                          ? 'Critical'
                          : message.scamScore > 70
                          ? 'High'
                          : 'Low'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(message.id)}
                      disabled={deleting === message.id}
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
