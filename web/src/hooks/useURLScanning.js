import { useState } from 'react';

export const useURLScanning = () => {
  const [scanning, setScanning] = useState(false);
  const [urlResults, setUrlResults] = useState([]);
  const [error, setError] = useState(null);

  const scanURLs = async (text) => {
    if (!text || !text.trim()) {
      setUrlResults([]);
      return [];
    }

    setScanning(true);
    setError(null);

    try {
      const authToken = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');

      const response = await fetch('/api/url/extract-and-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'X-User-Id': userId,
          'X-User-Email': userEmail,
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to scan URLs');
      }

      const data = await response.json();
      setUrlResults(data.results || []);
      return data.results || [];
    } catch (err) {
      setError(err.message);
      console.error('URL scanning error:', err);
      return [];
    } finally {
      setScanning(false);
    }
  };

  const clearResults = () => {
    setUrlResults([]);
    setError(null);
  };

  return {
    scanning,
    urlResults,
    error,
    scanURLs,
    clearResults,
  };
};
