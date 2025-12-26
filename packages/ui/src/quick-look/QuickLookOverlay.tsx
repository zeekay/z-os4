/**
 * QuickLookOverlay Component
 *
 * Modal overlay for previewing files, following macOS Quick Look aesthetic.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  X,
  Maximize2,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ImagePreview } from './ImagePreview';
import { TextPreview } from './TextPreview';
import { VideoPreview } from './VideoPreview';
import { AudioPreview } from './AudioPreview';
import { PDFPreview } from './PDFPreview';
import { GenericPreview } from './GenericPreview';

// Import types from core - these will be passed via props
export type FileType = 'image' | 'text' | 'video' | 'audio' | 'pdf' | 'unknown';

export interface QuickLookFile {
  id: string;
  name: string;
  path: string;
  mimeType?: string;
  size?: number;
  modified?: Date;
  dimensions?: { width: number; height: number };
  duration?: number;
  content?: string;
}

export interface QuickLookOverlayProps {
  /** Whether the overlay is visible */
  isOpen: boolean;
  /** Current file to preview */
  currentFile: QuickLookFile | null;
  /** List of files for navigation */
  fileList?: QuickLookFile[];
  /** Current index in file list */
  currentIndex?: number;
  /** Whether in fullscreen mode */
  isFullscreen?: boolean;
  /** Get file type from file */
  getFileType: (file: QuickLookFile) => FileType;
  /** Close handler */
  onClose: () => void;
  /** Navigate to next file */
  onNext?: () => void;
  /** Navigate to previous file */
  onPrev?: () => void;
  /** Toggle fullscreen */
  onToggleFullscreen?: () => void;
  /** Open with handler */
  onOpenWith?: (file: QuickLookFile) => void;
  /** Share handler */
  onShare?: (file: QuickLookFile) => void;
  /** Custom class name */
  className?: string;
  /** Animation origin position (for zoom animation) */
  animationOrigin?: { x: number; y: number };
}

export function QuickLookOverlay({
  isOpen,
  currentFile,
  fileList = [],
  currentIndex = 0,
  isFullscreen = false,
  getFileType,
  onClose,
  onNext,
  onPrev,
  onToggleFullscreen,
  onOpenWith,
  onShare,
  className,
  animationOrigin,
}: QuickLookOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Handle open/close animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setIsClosing(false);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    const timer = setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Handle click outside
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      handleClose();
    }
  }, [handleClose]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for navigation keys
      if (['ArrowLeft', 'ArrowRight', 'Escape', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;
  if (!currentFile) return null;

  const fileType = getFileType(currentFile);
  const hasMultipleFiles = fileList.length > 1;
  const canGoPrev = hasMultipleFiles && currentIndex > 0;
  const canGoNext = hasMultipleFiles && currentIndex < fileList.length - 1;

  // Animation styles
  const getAnimationStyle = () => {
    if (animationOrigin && (isAnimating || isClosing)) {
      return {
        transformOrigin: `${animationOrigin.x}px ${animationOrigin.y}px`,
      };
    }
    return {};
  };

  return (
    <div
      ref={overlayRef}
      className={cn(
        'fixed inset-0 z-[9999] flex items-center justify-center',
        'transition-all duration-200',
        isClosing ? 'bg-black/0' : 'bg-black/60',
        'backdrop-blur-sm',
        className
      )}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Quick Look: ${currentFile.name}`}
    >
      {/* Main panel */}
      <div
        className={cn(
          'relative flex flex-col bg-neutral-900/95 rounded-xl overflow-hidden shadow-2xl',
          'border border-white/10',
          'transition-all duration-200',
          isFullscreen ? 'w-full h-full rounded-none' : 'w-[80vw] h-[80vh] max-w-5xl max-h-[800px]',
          isAnimating && 'animate-in zoom-in-95 fade-in duration-200',
          isClosing && 'animate-out zoom-out-95 fade-out duration-150'
        )}
        style={getAnimationStyle()}
        onClick={e => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between h-12 px-4 bg-neutral-800/80 border-b border-white/5 shrink-0">
          {/* Left controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>

          {/* Title */}
          <div className="flex-1 text-center">
            <span className="text-sm font-medium text-white/90 truncate block px-4">
              {currentFile.name}
            </span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1">
            {onShare && (
              <button
                onClick={() => onShare(currentFile)}
                className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors"
                aria-label="Share"
              >
                <Share2 className="w-4 h-4 text-white/70" />
              </button>
            )}
            {onOpenWith && (
              <button
                onClick={() => onOpenWith(currentFile)}
                className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors"
                aria-label="Open with"
              >
                <ExternalLink className="w-4 h-4 text-white/70" />
              </button>
            )}
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors"
                aria-label="Toggle fullscreen"
              >
                <Maximize2 className="w-4 h-4 text-white/70" />
              </button>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden relative">
          {/* Preview component based on file type */}
          {fileType === 'image' && (
            <ImagePreview
              src={currentFile.path}
              alt={currentFile.name}
              className="w-full h-full"
            />
          )}

          {fileType === 'text' && (
            <TextPreview
              content={currentFile.content || ''}
              filename={currentFile.name}
              className="w-full h-full bg-neutral-900"
            />
          )}

          {fileType === 'video' && (
            <VideoPreview
              src={currentFile.path}
              className="w-full h-full"
            />
          )}

          {fileType === 'audio' && (
            <AudioPreview
              src={currentFile.path}
              filename={currentFile.name}
              className="w-full h-full bg-gradient-to-b from-neutral-800 to-neutral-900"
            />
          )}

          {fileType === 'pdf' && (
            <PDFPreview
              src={currentFile.path}
              filename={currentFile.name}
              className="w-full h-full"
            />
          )}

          {fileType === 'unknown' && (
            <GenericPreview
              filename={currentFile.name}
              size={currentFile.size}
              modified={currentFile.modified}
              mimeType={currentFile.mimeType}
              className="w-full h-full bg-gradient-to-b from-neutral-800 to-neutral-900"
            />
          )}

          {/* Navigation arrows */}
          {hasMultipleFiles && (
            <>
              {/* Previous button */}
              <button
                onClick={onPrev}
                disabled={!canGoPrev}
                className={cn(
                  'absolute left-4 top-1/2 -translate-y-1/2',
                  'w-10 h-10 flex items-center justify-center',
                  'bg-black/50 hover:bg-black/70 rounded-full',
                  'transition-all duration-200',
                  'disabled:opacity-30 disabled:cursor-not-allowed'
                )}
                aria-label="Previous file"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              {/* Next button */}
              <button
                onClick={onNext}
                disabled={!canGoNext}
                className={cn(
                  'absolute right-4 top-1/2 -translate-y-1/2',
                  'w-10 h-10 flex items-center justify-center',
                  'bg-black/50 hover:bg-black/70 rounded-full',
                  'transition-all duration-200',
                  'disabled:opacity-30 disabled:cursor-not-allowed'
                )}
                aria-label="Next file"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}
        </div>

        {/* Footer with file info */}
        <div className="flex items-center justify-between h-8 px-4 bg-neutral-800/50 border-t border-white/5 shrink-0">
          {/* File info */}
          <div className="flex items-center gap-4 text-xs text-white/40">
            {currentFile.dimensions && (
              <span>{currentFile.dimensions.width} x {currentFile.dimensions.height}</span>
            )}
            {currentFile.size !== undefined && (
              <span>{formatFileSize(currentFile.size)}</span>
            )}
          </div>

          {/* Navigation indicator */}
          {hasMultipleFiles && (
            <div className="text-xs text-white/40 tabular-nums">
              {currentIndex + 1} of {fileList.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default QuickLookOverlay;
