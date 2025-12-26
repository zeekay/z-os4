/**
 * Safari App
 *
 * Web browser for zOS following macOS Safari patterns.
 */

import React, { useState } from 'react';
import { ZWindow } from '@z-os/ui';
import { ChevronLeft, ChevronRight, RotateCw, Share, Plus, Lock, Compass } from 'lucide-react';

interface SafariWindowProps {
  onClose: () => void;
  onFocus?: () => void;
}

const SafariWindow: React.FC<SafariWindowProps> = ({ onClose, onFocus }) => {
  const [url, setUrl] = useState('https://hanzo.ai');
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <ZWindow
      title="Safari"
      onClose={onClose}
      onFocus={onFocus}
      initialPosition={{ x: 100, y: 50 }}
      initialSize={{ width: 1000, height: 700 }}
      windowType="safari"
    >
      <div className="flex flex-col h-full bg-[#1e1e1e]">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-black/20">
          {/* Navigation buttons */}
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4 text-white/70" />
            </button>
            <button className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30">
              <ChevronRight className="w-4 h-4 text-white/70" />
            </button>
          </div>

          {/* URL bar */}
          <form onSubmit={handleNavigate} className="flex-1 max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-3 h-3 text-green-400" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full h-8 pl-8 pr-10 rounded-lg bg-white/5 border border-white/10 text-sm text-white/90 text-center focus:outline-none focus:border-blue-500/50"
              />
              {isLoading ? (
                <RotateCw className="absolute right-3 w-4 h-4 text-white/50 animate-spin" />
              ) : (
                <RotateCw className="absolute right-3 w-4 h-4 text-white/30 hover:text-white/50 cursor-pointer" />
              )}
            </div>
          </form>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded hover:bg-white/10">
              <Share className="w-4 h-4 text-white/70" />
            </button>
            <button className="p-1.5 rounded hover:bg-white/10">
              <Plus className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 px-2 py-1 border-b border-white/10 bg-black/10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <img src="https://hanzo.ai/favicon.ico" alt="" className="w-4 h-4" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            <span className="text-xs text-white/70 max-w-[150px] truncate">Hanzo AI</span>
            <button className="text-white/30 hover:text-white/60 ml-1">x</button>
          </div>
          <button className="p-1 rounded hover:bg-white/5">
            <Plus className="w-4 h-4 text-white/40" />
          </button>
        </div>

        {/* Browser content */}
        <div className="flex-1 bg-white overflow-hidden">
          <iframe
            src={url}
            title="Browser Content"
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>
      </div>
    </ZWindow>
  );
};

// ============================================================================
// App Definition
// ============================================================================

/**
 * Safari app manifest
 */
export const SafariManifest = {
  identifier: 'ai.hanzo.safari',
  name: 'Safari',
  version: '1.0.0',
  description: 'Web browser for zOS',
  category: 'productivity' as const,
  permissions: ['network'] as const,
  window: {
    type: 'safari' as const,
    defaultSize: { width: 1000, height: 700 },
    resizable: true,
    showInDock: true,
  },
};

/**
 * Safari menu bar configuration
 */
export const SafariMenuBar = {
  menus: [
    {
      id: 'file',
      label: 'File',
      items: [
        { type: 'item' as const, id: 'newWindow', label: 'New Window', shortcut: '⌘N' },
        { type: 'item' as const, id: 'newPrivateWindow', label: 'New Private Window', shortcut: '⇧⌘N' },
        { type: 'item' as const, id: 'newTab', label: 'New Tab', shortcut: '⌘T' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'openLocation', label: 'Open Location...', shortcut: '⌘L' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'close', label: 'Close Tab', shortcut: '⌘W' },
        { type: 'item' as const, id: 'closeWindow', label: 'Close Window', shortcut: '⇧⌘W' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'saveAs', label: 'Save As...', shortcut: '⌘S' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'print', label: 'Print...', shortcut: '⌘P' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { type: 'item' as const, id: 'undo', label: 'Undo', shortcut: '⌘Z' },
        { type: 'item' as const, id: 'redo', label: 'Redo', shortcut: '⇧⌘Z' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'cut', label: 'Cut', shortcut: '⌘X' },
        { type: 'item' as const, id: 'copy', label: 'Copy', shortcut: '⌘C' },
        { type: 'item' as const, id: 'paste', label: 'Paste', shortcut: '⌘V' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'find', label: 'Find...', shortcut: '⌘F' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { type: 'item' as const, id: 'showToolbar', label: 'Show Toolbar' },
        { type: 'item' as const, id: 'showSidebar', label: 'Show Sidebar', shortcut: '⇧⌘L' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'zoomIn', label: 'Zoom In', shortcut: '⌘+' },
        { type: 'item' as const, id: 'zoomOut', label: 'Zoom Out', shortcut: '⌘-' },
        { type: 'item' as const, id: 'actualSize', label: 'Actual Size', shortcut: '⌘0' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'fullScreen', label: 'Enter Full Screen', shortcut: '⌃⌘F' },
      ],
    },
    {
      id: 'history',
      label: 'History',
      items: [
        { type: 'item' as const, id: 'back', label: 'Back', shortcut: '⌘[' },
        { type: 'item' as const, id: 'forward', label: 'Forward', shortcut: '⌘]' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'home', label: 'Home' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'showHistory', label: 'Show All History', shortcut: '⌘Y' },
        { type: 'item' as const, id: 'clearHistory', label: 'Clear History...' },
      ],
    },
    {
      id: 'bookmarks',
      label: 'Bookmarks',
      items: [
        { type: 'item' as const, id: 'showBookmarks', label: 'Show All Bookmarks' },
        { type: 'item' as const, id: 'addBookmark', label: 'Add Bookmark...', shortcut: '⌘D' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'favorites', label: 'Favorites' },
      ],
    },
    {
      id: 'window',
      label: 'Window',
      items: [
        { type: 'item' as const, id: 'minimize', label: 'Minimize', shortcut: '⌘M' },
        { type: 'item' as const, id: 'zoom', label: 'Zoom' },
        { type: 'separator' as const },
        { type: 'item' as const, id: 'showAllTabs', label: 'Show All Tabs', shortcut: '⇧⌘\\' },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { type: 'item' as const, id: 'safariHelp', label: 'Safari Help' },
      ],
    },
  ],
};

/**
 * Safari dock configuration
 */
export const SafariDockConfig = {
  contextMenu: [
    { type: 'item' as const, id: 'newWindow', label: 'New Window' },
    { type: 'item' as const, id: 'newPrivateWindow', label: 'New Private Window' },
    { type: 'separator' as const },
    { type: 'item' as const, id: 'options', label: 'Options' },
  ],
};

/**
 * Safari App definition for registry
 */
export const SafariApp = {
  manifest: SafariManifest,
  component: SafariWindow,
  icon: Compass,
  menuBar: SafariMenuBar,
  dockConfig: SafariDockConfig,
};

export default SafariWindow;
