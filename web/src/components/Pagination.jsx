import { ChevronLeft, ChevronRight } from 'lucide-react';
import { colors } from '../theme/colors';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  loading,
}) {
  if (totalPages <= 1) return null;

  return (
    <div
      className="flex items-center justify-between mt-6 pt-4"
      style={{ borderTop: `1px solid ${colors.border.light}` }}
    >
      <div style={{ fontSize: '0.875rem', color: colors.text.secondary }}>
        Page {currentPage} of {totalPages}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            border: `1px solid ${colors.border.light}`,
            color: colors.text.secondary,
          }}
          onMouseEnter={(e) => {
            if (!(currentPage === 1 || loading)) {
              e.currentTarget.style.backgroundColor = colors.background.secondary;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
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
                className="w-9 h-9 rounded-lg transition disabled:opacity-50"
                style={{
                  backgroundColor:
                    currentPage === pageNum
                      ? colors.primary[500]
                      : colors.background.primary,
                  color:
                    currentPage === pageNum
                      ? colors.text.white
                      : colors.text.primary,
                  border:
                    currentPage === pageNum
                      ? `1px solid ${colors.primary[500]}`
                      : `1px solid ${colors.border.light}`,
                  fontWeight: currentPage === pageNum ? '600' : '400',
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== pageNum && !loading) {
                    e.currentTarget.style.backgroundColor =
                      colors.background.secondary;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    currentPage === pageNum
                      ? colors.primary[500]
                      : colors.background.primary;
                }}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            border: `1px solid ${colors.border.light}`,
            color: colors.text.secondary,
          }}
          onMouseEnter={(e) => {
            if (!(currentPage === totalPages || loading)) {
              e.currentTarget.style.backgroundColor = colors.background.secondary;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="Next page"
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
