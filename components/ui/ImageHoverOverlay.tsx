'use client';

import React, { useState } from 'react';

interface ImageHoverOverlayProps {
  src: string;
  alt: string;
  className?: string;
  overlayContent?: React.ReactNode;
  overlayColor?: string;
  scaleAmount?: number;
}

export default function ImageHoverOverlay({ 
  src, 
  alt, 
  className = '', 
  overlayContent,
  overlayColor = 'rgba(0, 0, 0, 0.7)',
  scaleAmount = 1.1
}: ImageHoverOverlayProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative overflow-hidden cursor-pointer group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Image */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-all duration-500 ease-out"
        style={{
          transform: isHovered ? `scale(${scaleAmount})` : 'scale(1)',
          filter: isHovered ? 'brightness(0.7) contrast(1.1) saturate(1.2)' : 'brightness(0.95) contrast(1.05) saturate(1.1)'
        }}
      />
      
      {/* Overlay Layer */}
      <div 
        className="absolute inset-0 transition-all duration-500 ease-out flex items-center justify-center"
        style={{
          background: isHovered ? overlayColor : 'transparent',
          backdropFilter: isHovered ? 'blur(2px)' : 'none'
        }}
      >
        {/* Overlay Content */}
        {overlayContent && (
          <div 
            className="transition-all duration-500 ease-out transform"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)'
            }}
          >
            {overlayContent}
          </div>
        )}
      </div>
      
      {/* Border Glow Effect */}
      <div 
        className="absolute inset-0 rounded-lg transition-all duration-500 ease-out pointer-events-none"
        style={{
          boxShadow: isHovered 
            ? 'inset 0 0 20px rgba(255, 255, 255, 0.3), 0 0 30px rgba(255, 0, 0, 0.5)' 
            : 'inset 0 0 0px rgba(255, 255, 255, 0)',
          border: isHovered ? '2px solid rgba(255, 255, 255, 0.5)' : '2px solid transparent'
        }}
      />
    </div>
  );
}
