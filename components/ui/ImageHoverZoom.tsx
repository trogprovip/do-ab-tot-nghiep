'use client';

import React, { useState, useRef } from 'react';

interface ImageHoverZoomProps {
  src: string;
  alt: string;
  className?: string;
  zoomLevel?: number;
  onDoubleClick?: () => void;
}

export default function ImageHoverZoom({ 
  src, 
  alt, 
  className = '', 
  zoomLevel = 2.5,
  onDoubleClick
}: ImageHoverZoomProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !isHovered) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate position as percentage
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setPosition({ x: xPercent, y: yPercent });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-crosshair ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={onDoubleClick}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className="w-full h-full transition-transform duration-200 ease-out"
        style={{
          transform: isHovered ? `scale(${zoomLevel})` : 'scale(1)',
          transformOrigin: isHovered ? `${position.x}% ${position.y}%` : 'center',
          filter: 'brightness(0.95) contrast(1.05) saturate(1.1)',
          objectFit: 'cover'
        }}
      />
      
      {/* Optional: Add zoom indicator */}
      {isHovered && (
        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
          {zoomLevel}x Zoom
        </div>
      )}
    </div>
  );
}
