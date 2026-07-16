import { Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  totalItems?: number;
}

type PageToken = number | '...';

function buildPageList(current: number, total: number): PageToken[] {
  const delta = 1;
  const range: number[] = [];
  const withDots: PageToken[] = [];
  let last = 0;

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (last) {
      if (i - last === 2) withDots.push(last + 1);
      else if (i - last !== 1) withDots.push('...');
    }
    withDots.push(i);
    last = i;
  }

  return withDots;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem =
    totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : 0;

  const pageList = buildPageList(currentPage, totalPages);

  const baseBtn =
    'inline-flex items-center justify-center h-9 min-w-9 px-2 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40 disabled:pointer-events-none';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
      {totalItems && pageSize ? (
        <p className="text-sm text-text-muted order-2 sm:order-1">
          {startItem}–{endItem} de {totalItems}
        </p>
      ) : (
        <span className="order-2 sm:order-1" />
      )}

      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${baseBtn} text-text-main hover:bg-surface-hover border border-border`}
          aria-label="Página anterior"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="w-4 h-4" />
        </button>

        {pageList.map((page, index) => (
          <Fragment key={index}>
            {typeof page === 'number' ? (
              <button
                type="button"
                onClick={() => onPageChange(page)}
                className={`${baseBtn} ${
                  currentPage === page
                    ? 'bg-primary text-white border border-primary'
                    : 'text-text-main hover:bg-surface-hover border border-border'
                }`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            ) : (
              <span className="px-1 text-text-subtle">…</span>
            )}
          </Fragment>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${baseBtn} text-text-main hover:bg-surface-hover border border-border`}
          aria-label="Próxima página"
        >
          <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
