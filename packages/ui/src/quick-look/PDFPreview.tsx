/**
 * PDFPreview Component
 *
 * PDF viewer with page navigation for Quick Look.
 * Uses native browser PDF rendering via iframe.
 */

import React, { useState, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

export interface PDFPreviewProps {
  src: string;
  filename?: string;
  className?: string;
}

export function PDFPreview({ src, filename, className }: PDFPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);

  // Note: Page count and navigation would require a PDF library
  // For now, we use browser's native PDF viewer which handles this
  const totalPages = 1; // Placeholder

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setError(true);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(200, prev + 25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(50, prev - 25));
  }, []);

  const handlePrevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center h-full text-white/50 gap-4', className)}>
        <FileText className="w-16 h-16 text-white/30" />
        <span>Failed to load PDF</span>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
        >
          Open in new tab
        </a>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/30 border-b border-white/10">
        {/* Page navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1.5 hover:bg-white/10 rounded disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-white/70" />
          </button>
          <span className="text-sm text-white/70 tabular-nums min-w-[80px] text-center">
            Page {currentPage}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className="p-1.5 hover:bg-white/10 rounded disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-white/70" />
          </button>
        </div>

        {/* Filename */}
        <span className="text-sm text-white/50 truncate max-w-[200px]">
          {filename || 'PDF Document'}
        </span>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="p-1.5 hover:bg-white/10 rounded disabled:opacity-30 transition-colors"
          >
            <ZoomOut className="w-4 h-4 text-white/70" />
          </button>
          <span className="text-sm text-white/70 tabular-nums min-w-[50px] text-center">
            {zoom}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="p-1.5 hover:bg-white/10 rounded disabled:opacity-30 transition-colors"
          >
            <ZoomIn className="w-4 h-4 text-white/70" />
          </button>
        </div>
      </div>

      {/* PDF viewer */}
      <div className="flex-1 relative overflow-auto bg-neutral-800">
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 z-10">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
          </div>
        )}

        {/* PDF iframe */}
        <iframe
          ref={iframeRef}
          src={`${src}#toolbar=0&navpanes=0&scrollbar=1&zoom=${zoom}`}
          className="w-full h-full border-0"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
            width: `${10000 / zoom}%`,
            height: `${10000 / zoom}%`,
          }}
          onLoad={handleLoad}
          onError={handleError}
          title={filename || 'PDF Preview'}
        />
      </div>

      {/* Open externally link */}
      <div className="flex items-center justify-center py-2 bg-black/30 border-t border-white/10">
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          Open in new tab for full PDF controls
        </a>
      </div>
    </div>
  );
}

export default PDFPreview;
