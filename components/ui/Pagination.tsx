'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  totalElements, 
  size, 
  onPageChange 
}: PaginationProps) {
  const startElement = totalElements > 0 ? (currentPage * size) + 1 : 0;
  const endElement = Math.min((currentPage + 1) * size, totalElements);

  const getVisiblePages = () => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 0; i <= totalPages - 1; i++) {
      if (
        i === 0 ||
        i === totalPages - 1 ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l !== undefined) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      <div className="text-sm text-gray-700 mb-2 sm:mb-0">
        Hiển thị <span className="font-medium">{startElement}</span> đến{' '}
        <span className="font-medium">{endElement}</span> của{' '}
        <span className="font-medium">{totalElements}</span> kết quả
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getVisiblePages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-gray-500">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {(page as number) + 1}
              </button>
            )}
          </React.Fragment>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="p-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
