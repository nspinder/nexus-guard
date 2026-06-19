import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  loading,
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-e2e8f0">
      <div className="text-sm text-slate-600">
        Page {currentPage} of {totalPages}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-e2e8f0 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                disabled={loading}
                className={`w-9 h-9 rounded-lg transition ${
                  currentPage === pageNum
                    ? 'bg-blue-500 text-white font-semibold'
                    : 'border border-e2e8f0 hover:bg-slate-50 disabled:opacity-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-e2e8f0 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          aria-label="Next page"
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
