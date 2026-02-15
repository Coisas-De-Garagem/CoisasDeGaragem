import React from 'react';
import { Button } from './Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  totalItems?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
}: PaginationProps) {

  const startItem = totalItems ? (currentPage - 1) * pageSize! + 1 : 0;
  const endItem = totalItems ? Math.min(currentPage * pageSize!, totalItems) : 0;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let last;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (last) {
        if (i - last === 2) {
          rangeWithDots.push(last + 1);
        } else if (i - last !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      last = i;
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Info */}
      {totalItems && pageSize && (
        <p className="text-sm text-gray-600">
          Mostrando {startItem} a {endItem} de {totalItems} itens
        </p>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Button
          variant="tertiary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
        </Button>

        {/* Page Numbers */}
        {pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {typeof page === 'number' ? (
              <Button
                variant={currentPage === page ? 'primary' : 'tertiary'}
                onClick={() => onPageChange(page)}
                className="px-4 py-2 min-w-[40px]"
              >
                {page}
              </Button>
            ) : (
              <span className="px-2 py-2 text-gray-500">...</span>
            )}
          </React.Fragment>
        ))}

        {/* Next Button */}
        <Button
          variant="tertiary"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2"
        >
          <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
