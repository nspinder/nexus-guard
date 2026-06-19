import { Loader } from 'lucide-react';

export default function LoadingButton({
  children,
  loading = false,
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  variant = 'primary',
  ...props
}) {
  const baseClasses =
    'flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 disabled:hover:bg-blue-500',
    secondary:
      'bg-slate-100 text-slate-900 hover:bg-slate-200 disabled:hover:bg-slate-100',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:hover:bg-red-500',
    outline:
      'border border-slate-300 text-slate-900 hover:bg-slate-50 disabled:hover:bg-white',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader size={16} className="animate-spin" />}
      {children}
    </button>
  );
}
