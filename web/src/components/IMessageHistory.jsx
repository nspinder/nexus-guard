import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import apiClient from '../services/apiClient';
import { useURLScanning } from '../hooks/useURLScanning';
import URLScanResults from './URLScanResults';
import Pagination from './Pagination';
import SearchFilter from './SearchFilter';
import ErrorMessage from './ErrorMessage';
import { SkeletonItem } from './SkeletonLoader';
import '../styles/MessageHistory.css';

const PAGE_SIZE = 10;

export default function IMessageHistory() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedMessages, setExpandedMessages] = useState({});
  const [messageURLs, setMessageURLs] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const { scanURLs } = useURLScanning();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, riskFilter]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [currentPage, searchQuery, riskFilter]);

  const fetchMessages = async () => {
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
        `/imessage/history?${params.toString()}`
      );

      setMessages(data.messages || []);
      setTotalItems(data.total || 0);

      // Scan URLs in messages
      const urlMap = {};
      for (const message of (data.messages || [])) {
        const urls = await scanURLs(message.messageText);
        if (urls.length > 0) {
          urlMap[message.id] = urls;
        }
      }
      setMessageURLs(urlMap);
    } catch (err) {
      console.error('Failed to fetch iMessage history:', err);
      setError(err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (messageId) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const deleteMessage = async (messageId) => {
    try {
      await apiClient.delete(`/imessage/${messageId}`);
      setMessages(messages.filter((m) => m.id !== messageId));
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const getRiskColor = (score) => {
    if (score < 30) return '#10b981'; // green
    if (score < 60) return '#f97316'; // orange
    if (score < 80) return '#ef4444'; // red
    return '#991b1b'; // dark red
  };

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  return (
    <div className="message-history space-y-4">
      <div>
        <h2>📱 iMessage History</h2>
        <p className="text-475569">{totalItems} messages total</p>
      </div>

      {error && (
        <ErrorMessage
          error={error}
          onRetry={fetchMessages}
          onDismiss={() => setError(null)}
          title="Failed to load iMessages"
        />
      )}

      <SearchFilter
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search by sender or message..."
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
      ) : messages.length === 0 ? (
        <p className="empty-state">No iMessages monitored yet</p>
      ) : (
        <>
          <div className="messages-list">
            {messages.map((message) => (
              <div key={message.id} className="message-item">
                <div className="message-header">
                  <div
                    className="message-info"
                    onClick={() => toggleExpanded(message.id)}
                    style={{ cursor: 'pointer', flex: 1 }}
                  >
                    <span className="sender">{message.sender}</span>
                    <span className="date">{new Date(message.createdAt).toLocaleDateString()}</span>
                    {messageURLs[message.id] && messageURLs[message.id].length > 0 && (
                      <span className="url-indicator" title={`${messageURLs[message.id].length} URL(s) detected`}>
                        🔗 {messageURLs[message.id].length}
                      </span>
                    )}
                  </div>
                  <div className="score-badge" style={{ backgroundColor: getRiskColor(message.scamScore) }}>
                    {Math.round(message.scamScore)}%
                  </div>
                  <button
                    onClick={() => deleteMessage(message.id)}
                    className="delete-btn"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {expandedMessages[message.id] && (
                  <div className="message-details">
                    <p className="message-text">{message.messageText}</p>
                    {message.claudeReasoning && (
                      <p className="reasoning">💭 {message.claudeReasoning}</p>
                    )}
                    {messageURLs[message.id] && messageURLs[message.id].length > 0 && (
                      <URLScanResults urls={messageURLs[message.id]} />
                    )}
                  </div>
                )}
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
