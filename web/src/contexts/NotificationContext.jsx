import { createContext, useContext, useState, useCallback } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    const notification = { id, message, type };

    setNotifications((prev) => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const success = useCallback(
    (message, duration) => addNotification(message, 'success', duration),
    [addNotification]
  );

  const error = useCallback(
    (message, duration) => addNotification(message, 'error', duration),
    [addNotification]
  );

  const info = useCallback(
    (message, duration) => addNotification(message, 'info', duration),
    [addNotification]
  );

  const warning = useCallback(
    (message, duration) => addNotification(message, 'warning', duration),
    [addNotification]
  );

  return (
    <NotificationContext.Provider
      value={{
        addNotification,
        removeNotification,
        success,
        error,
        info,
        warning,
      }}
    >
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

function NotificationContainer({ notifications, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onRemove={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
}

function Notification({ notification, onRemove }) {
  const getStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          text: 'text-green-800',
          Icon: CheckCircle,
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          text: 'text-red-800',
          Icon: AlertCircle,
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          text: 'text-yellow-800',
          Icon: AlertCircle,
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          text: 'text-blue-800',
          Icon: Info,
        };
    }
  };

  const styles = getStyles();
  const Icon = styles.Icon;

  return (
    <div className={`${styles.bg} border ${styles.border} rounded-lg p-4 flex items-start gap-3 shadow-lg animate-in slide-in-from-right`}>
      <Icon className={`w-5 h-5 ${styles.icon} flex-shrink-0 mt-0.5`} />
      <p className={`flex-1 text-sm font-medium ${styles.text}`}>
        {notification.message}
      </p>
      <button
        onClick={onRemove}
        className="flex-shrink-0 text-slate-400 hover:text-slate-600"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
