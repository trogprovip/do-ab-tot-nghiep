import React from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';

interface BackButtonProps {
  onClick: () => void;
  text?: string;
  className?: string;
}

export default function BackButton({ 
  onClick, 
  text = "Quay lại", 
  className = "" 
}: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 group text-gray-500 hover:text-red-600 transition-colors ${className}`}
    >
      <div className="p-2 rounded-full bg-white shadow-sm group-hover:bg-red-50 transition-colors">
        <ArrowLeftOutlined />
      </div>
      <span className="font-semibold text-sm uppercase tracking-wider">{text}</span>
    </button>
  );
}
