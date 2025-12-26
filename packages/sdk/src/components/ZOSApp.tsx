/**
 * ZOSApp Component
 *
 * Base wrapper component for zOS applications. Provides standard window
 * chrome, lifecycle management, dock integration, menu bar, and SDK context.
 */

import React, { createContext, useContext, ReactNode, useMemo, useEffect } from 'react';
import { ZWindow } from '@z-os/ui';
import {
  AppManifest,
  WindowType,
  AppContext,
  AppMenuBar,
  DockConfig,
  DockAPI,
  MenuAPI,
} from '../types';
import { useApp } from '../hooks/useApp';
import { useNotifications } from '../hooks/useNotifications';
import { useStorage } from '../hooks/useStorage';
import { useFileSystem } from '../hooks/useFileSystem';
import { useClipboard } from '../hooks/useClipboard';
import { useKeyboard } from '../hooks/useKeyboard';
import { useMenu } from '../hooks/useMenu';
import { useDock } from '../hooks/useDock';

// ============================================================================
// SDK Context
// ============================================================================

interface ZOSSDKContext {
  app: AppContext;
  notifications: ReturnType<typeof useNotifications>;
  storage: ReturnType<typeof useStorage>;
  fs: ReturnType<typeof useFileSystem>;
  clipboard: ReturnType<typeof useClipboard>;
  keyboard: ReturnType<typeof useKeyboard>;
  menu: MenuAPI;
  dock: DockAPI;
}

const SDKContext = createContext<ZOSSDKContext | null>(null);

/**
 * useSDK - Access all SDK functionality from within a ZOSApp
 *
 * @example
 * ```tsx
 * function MyAppContent() {
 *   const { app, notifications, fs, menu, dock } = useSDK();
 *
 *   useEffect(() => {
 *     // Set up menu bar
 *     menu.setMenuBar({
 *       menus: [
 *         { id: 'file', label: 'File', items: [...] },
 *       ]
 *     });
 *
 *     // Set dock badge
 *     dock.setBadge(5);
 *   }, []);
 *
 *   const handleSave = async () => {
 *     await fs.writeFile('/documents/file.txt', 'content');
 *     notifications.show({ title: 'Saved!' });
 *   };
 *
 *   return <button onClick={handleSave}>Save</button>;
 * }
 * ```
 */
export function useSDK(): ZOSSDKContext {
  const context = useContext(SDKContext);
  if (!context) {
    throw new Error('useSDK must be used within a ZOSApp component');
  }
  return context;
}

// ============================================================================
// ZOSApp Component
// ============================================================================

interface ZOSAppProps {
  /** App manifest defining metadata and capabilities */
  manifest: AppManifest;

  /** App content */
  children: ReactNode;

  /** Close callback */
  onClose: () => void;

  /** Focus callback */
  onFocus?: () => void;

  /** Initial menu bar configuration */
  menuBar?: AppMenuBar;

  /** Dock configuration */
  dockConfig?: DockConfig;

  /** Custom title bar controls */
  customControls?: ReactNode;

  /** Additional class names for the window */
  className?: string;

  /** Lifecycle hooks */
  lifecycle?: {
    onLaunch?: () => void;
    onActivate?: () => void;
    onDeactivate?: () => void;
    onClose?: () => boolean | void;
    onReceiveData?: (data: unknown, from: string) => void;
  };
}

/**
 * ZOSApp - Base wrapper for building zOS applications
 *
 * Provides:
 * - Standard macOS-style window chrome
 * - App lifecycle management
 * - Menu bar integration
 * - Dock icon integration (badges, progress, context menu)
 * - SDK context with all hooks pre-initialized
 *
 * @example
 * ```tsx
 * const manifest: AppManifest = {
 *   identifier: 'ai.hanzo.myapp',
 *   name: 'My App',
 *   version: '1.0.0',
 *   window: {
 *     defaultSize: { width: 600, height: 400 },
 *     resizable: true,
 *   }
 * };
 *
 * const menuBar: AppMenuBar = {
 *   menus: [
 *     createFileMenu({ onNew, onSave, onClose }),
 *     createEditMenu({ onCopy, onPaste }),
 *   ]
 * };
 *
 * function MyApp({ onClose }) {
 *   return (
 *     <ZOSApp manifest={manifest} menuBar={menuBar} onClose={onClose}>
 *       <MyAppContent />
 *     </ZOSApp>
 *   );
 * }
 * ```
 */
export function ZOSApp({
  manifest,
  children,
  onClose,
  onFocus,
  menuBar,
  dockConfig,
  customControls,
  className,
  lifecycle,
}: ZOSAppProps): JSX.Element {
  // Initialize all SDK hooks
  const app = useApp({ manifest, onClose, onFocus });
  const notifications = useNotifications();
  const storage = useStorage({ namespace: manifest.identifier });
  const fs = useFileSystem();
  const clipboard = useClipboard();
  const keyboard = useKeyboard();
  const menu = useMenu({ appId: manifest.identifier });
  const dock = useDock({ appId: manifest.identifier });

  // Set up initial menu bar if provided
  useEffect(() => {
    if (menuBar) {
      menu.setMenuBar(menuBar);
    }
  }, [menuBar, menu]);

  // Set up dock configuration if provided
  useEffect(() => {
    if (dockConfig) {
      if (dockConfig.badge !== undefined) {
        dock.setBadge(dockConfig.badge);
      }
      if (dockConfig.progress !== undefined) {
        dock.setProgress(dockConfig.progress);
      }
      if (dockConfig.contextMenu) {
        dock.setContextMenu(dockConfig.contextMenu);
      }
      if (dockConfig.bounce) {
        dock.bounce('informational');
      }
    }
  }, [dockConfig, dock]);

  // Handle lifecycle events
  useEffect(() => {
    // Call onLaunch when component mounts
    if (lifecycle?.onLaunch) {
      lifecycle.onLaunch();
    }

    // Cleanup on unmount
    return () => {
      // Clear dock state
      dock.setBadge(null);
      dock.setProgress(null);
    };
  }, []);

  // Handle app activation/deactivation
  useEffect(() => {
    if (app.isActive && lifecycle?.onActivate) {
      lifecycle.onActivate();
    } else if (!app.isActive && lifecycle?.onDeactivate) {
      lifecycle.onDeactivate();
    }
  }, [app.isActive, lifecycle]);

  // Memoize SDK context
  const sdkContext = useMemo<ZOSSDKContext>(() => ({
    app,
    notifications,
    storage,
    fs,
    clipboard,
    keyboard,
    menu,
    dock,
  }), [app, notifications, storage, fs, clipboard, keyboard, menu, dock]);

  // Get window configuration from manifest
  const windowConfig = manifest.window || {};
  const windowType = (windowConfig.type || 'default') as WindowType;
  const defaultSize = windowConfig.defaultSize || { width: 700, height: 500 };
  const defaultPosition = windowConfig.defaultPosition;
  const resizable = windowConfig.resizable !== false;

  // Handle close with lifecycle hook
  const handleClose = () => {
    if (lifecycle?.onClose) {
      const shouldClose = lifecycle.onClose();
      if (shouldClose === false) {
        return; // Prevent close if lifecycle hook returns false
      }
    }
    onClose();
  };

  return (
    <SDKContext.Provider value={sdkContext}>
      <ZWindow
        title={manifest.name}
        onClose={handleClose}
        onFocus={onFocus}
        initialSize={defaultSize}
        initialPosition={defaultPosition}
        windowType={windowType}
        resizable={resizable}
        customControls={customControls}
        className={className}
      >
        {children}
      </ZWindow>
    </SDKContext.Provider>
  );
}

export default ZOSApp;
