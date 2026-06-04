import { useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

let socket = null;

export function useRealtimeAlerts(userId, onScamDetected) {
  useEffect(() => {
    if (!userId) return;

    // Create socket connection
    socket = io(window.location.origin, {
      query: { userId },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Listen for scam alerts
    socket.on('scam_detected', (data) => {
      console.log('✓ Scam alert received:', data);
      if (onScamDetected) {
        onScamDetected(data);
      }
    });

    // Handle connection events
    socket.on('connect', () => {
      console.log('✓ Connected to real-time alerts');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from real-time alerts');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [userId, onScamDetected]);

  return socket;
}
