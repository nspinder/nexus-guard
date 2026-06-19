import { Search, X } from 'lucide-react';
import { useState } from 'react';

export default function SearchFilter({
  value,
  onChange,
  placeholder = 'Search...',
  onClear,
  loading,
  riskFilter,
  onRiskFilterChange,
  showRiskFilter = true,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 rounded-lg border border-e2e8f0 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            disabled={loading}
          />
          {value && (
            <button
              onClick={() => {
                onChange('');
                onClear?.();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded transition"
              aria-label="Clear search"
            >
              <X size={16} className="text-slate-400" />
            </button>
          )}
        </div>
        {showRiskFilter && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2 rounded-lg border border-e2e8f0 hover:bg-slate-50 transition"
          >
            Filter
          </button>
        )}
      </div>

      {showRiskFilter && isOpen && (
        <div className="bg-white rounded-lg border border-e2e8f0 p-3 space-y-2">
          <div className="text-sm font-medium text-slate-900">Risk Level</div>
          <div className="space-y-1">
            {[
              { value: '', label: 'All' },
              { value: 'low', label: '🟢 Low Risk' },
              { value: 'medium', label: '🟠 Medium Risk' },
              { value: 'high', label: '🔴 High Risk' },
            ].map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="riskFilter"
                  value={option.value}
                  checked={riskFilter === option.value}
                  onChange={(e) => onRiskFilterChange(e.target.value)}
                  className="rounded"
                />
                <span className="text-sm text-slate-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
