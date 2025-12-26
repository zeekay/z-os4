import type { ComponentType } from 'react';

export interface AppManifest {
  identifier: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  category?: AppCategory;
  icon?: string;
  permissions?: AppPermission[];
  repository?: string;
  homepage?: string;
  window?: WindowConfig;
}

export type AppCategory =
  | 'productivity'
  | 'development'
  | 'utilities'
  | 'entertainment'
  | 'communication'
  | 'finance'
  | 'system'
  | 'other';

export type AppPermission =
  | 'storage.local'
  | 'storage.sync'
  | 'notifications'
  | 'clipboard'
  | 'files.read'
  | 'files.write'
  | 'network'
  | 'system';

export interface WindowConfig {
  defaultSize?: { width: number; height: number };
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  resizable?: boolean;
  multipleInstances?: boolean;
}

export interface AppProps {
  onClose?: () => void;
  onFocus?: () => void;
  className?: string;
}

export interface LoadedApp {
  manifest: AppManifest;
  component: ComponentType<AppProps>;
  source: 'builtin' | 'zos-apps' | 'external';
}

export interface AppRegistry {
  apps: Record<string, RegistryEntry>;
  updated: string;
}

export interface RegistryEntry {
  name: string;
  version: string;
  cdn: string;
  integrity?: string;
  manifest: AppManifest;
}
