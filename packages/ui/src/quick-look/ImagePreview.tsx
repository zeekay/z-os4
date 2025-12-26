/**
 * ImagePreview Component
 *
 * Displays zoomable image preview for Quick Look.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';

export interface ImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImagePreview({ src, alt, className }: ImagePreviewProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when source changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsLoading(true);
    setError(false);
  }, [src]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.min(Math.max(0.1, prev + delta), 5));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  }, [scale, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDoubleClick = useCallback(() => {
    if (scale === 1) {
      setScale(2);
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [scale]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setError(true);
  }, []);

  if (error) {
    return (
      <div className={cn('flex items-center justify-center h-full text-white/50', className)}>
        <span>Failed to load image</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex items-center justify-center h-full overflow-hidden',
        scale > 1 ? 'cursor-grab' : 'cursor-zoom-in',
        isDragging && 'cursor-grabbing',
        className
      )}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
        </div>
      )}

      <img
        src={src}
        alt={alt}
        className={cn(
          'max-w-full max-h-full object-contain transition-transform select-none',
          isLoading && 'opacity-0'
        )}
        style={{
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          transitionDuration: isDragging ? '0ms' : '150ms',
        }}
        onLoad={handleLoad}
        onError={handleError}
        draggable={false}
      />

      {/* Zoom indicator */}
      {scale !== 1 && (
        <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/50 rounded text-xs text-white/80">
          {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  );
}

export default ImagePreview;
