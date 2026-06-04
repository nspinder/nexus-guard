import { AlertCircle, Zap, ArrowRight } from 'lucide-react';

export default function UpgradePrompt({ monthlyUsage, monthlyLimit, onUpgrade, tier }) {
  if (!monthlyLimit || monthlyUsage < monthlyLimit) {
    return null;
  }

  const percentUsed = ((monthlyUsage / monthlyLimit) * 100).toFixed(0);

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-300 mb-2">Monthly Email Limit Reached</h3>
          <p className="text-amber-200 text-sm mb-4">
            You've analyzed {monthlyUsage} of {monthlyLimit} emails this month.
            Upgrade to Pro for unlimited email analysis.
          </p>

          <div className="w-full bg-amber-900/30 rounded-full h-2 mb-4">
            <div
              className="bg-amber-400 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>

          <button
            onClick={onUpgrade}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition font-medium text-sm"
          >
            <Zap className="w-4 h-4" />
            Upgrade to Pro
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
