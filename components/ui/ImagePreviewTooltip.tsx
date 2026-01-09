'use client';

import React, { useState, useRef } from 'react';

interface ImagePreviewTooltipProps {
  src: string;
  alt: string;
  className?: string;
  previewSize?: { width: number; height: number };
  zoomLevel?: number;
}

export default function ImagePreviewTooltip({ 
  src, 
  alt, 
  className = '', 
  previewSize = { width: 400, height: 600 },
  zoomLevel = 2
}: ImagePreviewTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    // Calculate position for the preview tooltip
    const tooltipX = e.clientX + 20; // 20px offset from cursor
    const tooltipY = e.clientY - previewSize.height / 2;

    // Keep tooltip within viewport bounds
    const maxX = window.innerWidth - previewSize.width - 20;
    const maxY = window.innerHeight - previewSize.height - 20;
    
    const finalX = Math.min(tooltipX, maxX);
    const finalY = Math.max(20, Math.min(tooltipY, maxY));

    setMousePosition({ x: finalX, y: finalY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`relative cursor-pointer ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full rounded-lg shadow-lg"
          style={{
            filter: 'brightness(0.95) contrast(1.05) saturate(1.1)',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* Preview Tooltip */}
      {isHovered && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
            width: `${previewSize.width}px`,
            height: `${previewSize.height}px`,
          }}
        >
          <div className="relative w-full h-full">
            {/* Tooltip background with shadow */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-lg shadow-2xl border border-white/20"></div>
            
            {/* Preview image */}
            <img
              src={src}
              alt={alt}
              className="relative w-full h-full object-contain rounded-lg"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center',
              }}
            />
            
            {/* Zoom indicator */}
            <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-bold">
              {zoomLevel}x
            </div>
          </div>
        </div>
      )}
    </>
  );
}
