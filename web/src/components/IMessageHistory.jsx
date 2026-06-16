import { useEffect, useState } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';
import { useURLScanning } from '../hooks/useURLScanning';
import URLScanResults from './URLScanResults';
import '../styles/MessageHistory.css';

export default function IMessageHistory() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedMessages, setExpandedMessages] = useState({});
  const [messageURLs, setMessageURLs] = useState({});
  const { scanURLs } = useURLScanning();

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const userEmail = localStorage.getItem('userEmail');
      const userId = localStorage.getItem('userId');

      const response = await axios.get('/api/imessage/history?limit=100', {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-User-Email': userEmail,
          'X-User-Id': userId,
        },
      });

      setMessages(response.data.messages);

      // Scan URLs in messages
      const urlMap = {};
      for (const message of response.data.messages) {
        const urls = await scanURLs(message.messageText);
        if (urls.length > 0) {
          urlMap[message.id] = urls;
        }
      }
      setMessageURLs(urlMap);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch iMessage history:', err);
      setError('Failed to load iMessages');
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
      const authToken = localStorage.getItem('authToken');
      const userEmail = localStorage.getItem('userEmail');
      const userId = localStorage.getItem('userId');

      await axios.delete(`/api/imessage/${messageId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-User-Email': userEmail,
          'X-User-Id': userId,
        },
      });

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

  if (loading) {
    return <div className="message-history">Loading iMessages...</div>;
  }

  if (error) {
    return <div className="message-history error">{error}</div>;
  }

  return (
    <div className="message-history">
      <h2>📱 iMessage History</h2>
      {messages.length === 0 ? (
        <p className="empty-state">No iMessages monitored yet</p>
      ) : (
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
      )}
    </div>
  );
}
