import { AlertCircle, X, RotateCcw } from 'lucide-react';

export default function ErrorMessage({
  error,
  onRetry,
  onDismiss,
  title = 'Error',
  showRetry = true,
}) {
  // Extract user-friendly error message
  const getMessage = () => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    return 'An unexpected error occurred';
  };

  // Get helpful hint based on error type
  const getHint = () => {
    const msg = getMessage().toLowerCase();
    if (msg.includes('network') || msg.includes('econnrefused')) {
      return 'Check your internet connection and try again.';
    }
    if (msg.includes('timeout')) {
      return 'The request took too long. Try again with a better connection.';
    }
    if (msg.includes('401') || msg.includes('unauthorized')) {
      return 'Your session may have expired. Please log in again.';
    }
    if (msg.includes('403') || msg.includes('forbidden')) {
      return 'You don\'t have permission to perform this action.';
    }
    if (msg.includes('404') || msg.includes('not found')) {
      return 'The resource could not be found. It may have been deleted.';
    }
    if (msg.includes('429') || msg.includes('too many')) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    if (msg.includes('500') || msg.includes('server error')) {
      return 'The server encountered an error. Our team has been notified.';
    }
    return null;
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-red-900">{title}</h3>
          <p className="text-red-800 text-sm mt-1">{getMessage()}</p>
          {getHint() && <p className="text-red-700 text-xs mt-2">{getHint()}</p>}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-600 hover:text-red-900 flex-shrink-0"
            aria-label="Dismiss error"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {showRetry && onRetry && (
        <div className="flex gap-2 ml-8">
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-3 py-1 text-sm rounded bg-red-100 text-red-900 hover:bg-red-200 transition"
          >
            <RotateCcw size={14} />
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
