/**
 * useDock Hook
 *
 * Provides dock-related functionality for zOS apps including badges,
 * progress indicators, bounce effects, and context menus.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { DockAPI, DockMenuItem } from '../types';

// Global dock state storage (simulated - in production this would communicate with the shell)
interface DockState {
  badge: string | number | null;
  progress: number | null;
  bouncing: boolean;
  contextMenu: DockMenuItem[];
  attentionRequested: boolean;
}

const dockStates = new Map<string, DockState>();
const dockListeners = new Map<string, Set<() => void>>();

function notifyListeners(appId: string) {
  const listeners = dockListeners.get(appId);
  if (listeners) {
    listeners.forEach(listener => listener());
  }
}

/**
 * Subscribe to dock state changes for an app
 */
export function subscribeToDockChanges(appId: string, callback: () => void): () => void {
  if (!dockListeners.has(appId)) {
    dockListeners.set(appId, new Set());
  }
  dockListeners.get(appId)!.add(callback);
  return () => {
    dockListeners.get(appId)?.delete(callback);
  };
}

/**
 * Get the current dock state for an app
 */
export function getDockState(appId: string): DockState {
  if (!dockStates.has(appId)) {
    dockStates.set(appId, {
      badge: null,
      progress: null,
      bouncing: false,
      contextMenu: [],
      attentionRequested: false,
    });
  }
  return dockStates.get(appId)!;
}

interface UseDockOptions {
  appId: string;
}

/**
 * useDock - Dock integration for zOS apps
 *
 * @example
 * ```tsx
 * function MyApp() {
 *   const { setBadge, bounce, setContextMenu } = useDock({ appId: 'ai.hanzo.myapp' });
 *
 *   useEffect(() => {
 *     // Show notification count
 *     setBadge(5);
 *
 *     // Set up context menu
 *     setContextMenu([
 *       { type: 'item', id: 'new', label: 'New Window', onClick: handleNew },
 *       { type: 'separator' },
 *       { type: 'item', id: 'quit', label: 'Quit', onClick: handleQuit },
 *     ]);
 *   }, []);
 *
 *   const handleImportant = () => {
 *     bounce('critical');
 *   };
 * }
 * ```
 */
export function useDock({ appId }: UseDockOptions): DockAPI {
  const [, forceUpdate] = useState({});
  const stateRef = useRef(getDockState(appId));

  // Subscribe to changes
  useEffect(() => {
    const unsubscribe = subscribeToDockChanges(appId, () => {
      stateRef.current = getDockState(appId);
      forceUpdate({});
    });
    return unsubscribe;
  }, [appId]);

  /**
   * Set badge on dock icon (e.g., notification count)
   */
  const setBadge = useCallback((badge: string | number | null) => {
    const state = getDockState(appId);
    state.badge = badge;
    notifyListeners(appId);
  }, [appId]);

  /**
   * Set progress indicator (0-100)
   */
  const setProgress = useCallback((progress: number | null) => {
    const state = getDockState(appId);
    state.progress = progress !== null ? Math.max(0, Math.min(100, progress)) : null;
    notifyListeners(appId);
  }, [appId]);

  /**
   * Bounce dock icon to get user attention
   */
  const bounce = useCallback((type: 'critical' | 'informational' = 'informational') => {
    const state = getDockState(appId);
    state.bouncing = true;
    notifyListeners(appId);

    // Stop bouncing after duration (critical bounces until user interaction)
    if (type === 'informational') {
      setTimeout(() => {
        state.bouncing = false;
        notifyListeners(appId);
      }, 1000);
    }
  }, [appId]);

  /**
   * Set context menu items (shown on right-click)
   */
  const setContextMenu = useCallback((items: DockMenuItem[]) => {
    const state = getDockState(appId);
    state.contextMenu = items;
    notifyListeners(appId);
  }, [appId]);

  /**
   * Request user attention (visual indicator)
   */
  const requestAttention = useCallback(() => {
    const state = getDockState(appId);
    state.attentionRequested = true;
    bounce('informational');
    notifyListeners(appId);
  }, [appId, bounce]);

  return {
    setBadge,
    setProgress,
    bounce,
    setContextMenu,
    requestAttention,
  };
}

export default useDock;
