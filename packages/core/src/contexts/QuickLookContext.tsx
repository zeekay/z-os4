/**
 * Quick Look Context
 *
 * Provides state management for the Quick Look file preview system.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type {
  QuickLookFile,
  QuickLookState,
  QuickLookContextType,
  FileType,
} from '../types/quick-look';
import {
  EXTENSION_TYPE_MAP,
  MIME_TYPE_MAP,
} from '../types/quick-look';

const initialState: QuickLookState = {
  isOpen: false,
  currentFile: null,
  fileList: [],
  currentIndex: -1,
  isFullscreen: false,
};

const QuickLookContext = createContext<QuickLookContextType | undefined>(undefined);

export interface QuickLookProviderProps {
  children: ReactNode;
}

export function QuickLookProvider({ children }: QuickLookProviderProps) {
  const [state, setState] = useState<QuickLookState>(initialState);

  /**
   * Get file type from extension or MIME type
   */
  const getFileType = useCallback((file: QuickLookFile): FileType => {
    // First check MIME type
    if (file.mimeType && MIME_TYPE_MAP[file.mimeType]) {
      return MIME_TYPE_MAP[file.mimeType];
    }

    // Fall back to extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension && EXTENSION_TYPE_MAP[extension]) {
      return EXTENSION_TYPE_MAP[extension];
    }

    return 'unknown';
  }, []);

  /**
   * Show Quick Look for a file
   */
  const showQuickLook = useCallback((file: QuickLookFile, fileList?: QuickLookFile[]) => {
    const list = fileList || [file];
    const index = list.findIndex(f => f.id === file.id);

    setState({
      isOpen: true,
      currentFile: file,
      fileList: list,
      currentIndex: index >= 0 ? index : 0,
      isFullscreen: false,
    });
  }, []);

  /**
   * Hide Quick Look
   */
  const hideQuickLook = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      isFullscreen: false,
    }));
  }, []);

  /**
   * Navigate to next file
   */
  const nextFile = useCallback(() => {
    setState(prev => {
      if (prev.fileList.length === 0 || prev.currentIndex >= prev.fileList.length - 1) {
        return prev;
      }

      const newIndex = prev.currentIndex + 1;
      return {
        ...prev,
        currentIndex: newIndex,
        currentFile: prev.fileList[newIndex],
      };
    });
  }, []);

  /**
   * Navigate to previous file
   */
  const prevFile = useCallback(() => {
    setState(prev => {
      if (prev.fileList.length === 0 || prev.currentIndex <= 0) {
        return prev;
      }

      const newIndex = prev.currentIndex - 1;
      return {
        ...prev,
        currentIndex: newIndex,
        currentFile: prev.fileList[newIndex],
      };
    });
  }, []);

  /**
   * Toggle fullscreen mode
   */
  const toggleFullscreen = useCallback(() => {
    setState(prev => ({
      ...prev,
      isFullscreen: !prev.isFullscreen,
    }));
  }, []);

  /**
   * Handle keyboard navigation
   */
  useEffect(() => {
    if (!state.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          hideQuickLook();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          nextFile();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          prevFile();
          break;
        case ' ':
          // Space to close (same as macOS Quick Look)
          e.preventDefault();
          hideQuickLook();
          break;
        case 'f':
        case 'F':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isOpen, hideQuickLook, nextFile, prevFile, toggleFullscreen]);

  const contextValue: QuickLookContextType = {
    ...state,
    showQuickLook,
    hideQuickLook,
    nextFile,
    prevFile,
    toggleFullscreen,
    getFileType,
  };

  return (
    <QuickLookContext.Provider value={contextValue}>
      {children}
    </QuickLookContext.Provider>
  );
}

/**
 * Hook to access Quick Look context
 */
export function useQuickLook(): QuickLookContextType {
  const context = useContext(QuickLookContext);
  if (!context) {
    throw new Error('useQuickLook must be used within a QuickLookProvider');
  }
  return context;
}

export { QuickLookContext };
export type { QuickLookContextType, QuickLookFile, QuickLookState, FileType };
