import type { ComponentType } from 'react';
import type { AppManifest, LoadedApp, AppProps, AppRegistry, RegistryEntry } from './types';

// Cache for loaded apps
const appCache = new Map<string, LoadedApp>();

// Registry cache
let registryCache: AppRegistry | null = null;
let registryCacheTime = 0;
const REGISTRY_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch the app registry from GitHub Pages
 * Falls back to GitHub API if registry not available
 */
export async function fetchRegistry(): Promise<AppRegistry> {
  // Check cache
  if (registryCache && Date.now() - registryCacheTime < REGISTRY_TTL) {
    return registryCache;
  }

  try {
    // Try GitHub Pages registry first (no rate limit)
    const res = await fetch('https://zos-apps.github.io/registry/apps.json');
    if (res.ok) {
      registryCache = await res.json();
      registryCacheTime = Date.now();
      return registryCache!;
    }
  } catch {
    // Fall through to GitHub API
  }

  // Fallback: fetch from GitHub API
  return fetchRegistryFromGitHub();
}

/**
 * Fetch app list from GitHub API (rate limited)
 */
async function fetchRegistryFromGitHub(): Promise<AppRegistry> {
  const response = await fetch(
    'https://api.github.com/orgs/zos-apps/repos?per_page=100&sort=updated'
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const repos = await response.json();
  const apps: Record<string, RegistryEntry> = {};

  for (const repo of repos) {
    if (repo.name === 'template' || repo.name === '.github' || repo.name === 'registry') {
      continue;
    }

    try {
      const manifest = await fetchManifestFromGitHub(repo.full_name);
      apps[manifest.identifier] = {
        name: manifest.name,
        version: manifest.version,
        cdn: getCDNUrl(repo.name, manifest.version),
        manifest,
      };
    } catch {
      // Skip repos without valid manifest
    }
  }

  const registry: AppRegistry = {
    apps,
    updated: new Date().toISOString(),
  };

  registryCache = registry;
  registryCacheTime = Date.now();
  return registry;
}

/**
 * Fetch manifest from package.json in GitHub repo
 */
async function fetchManifestFromGitHub(fullName: string): Promise<AppManifest> {
  const response = await fetch(
    `https://api.github.com/repos/${fullName}/contents/package.json`
  );

  if (!response.ok) {
    throw new Error('No package.json found');
  }

  const data = await response.json();
  const content = atob(data.content);
  const pkg = JSON.parse(content);
  const zos = pkg.zos || {};

  return {
    identifier: zos.id || `apps.zos.${fullName.split('/')[1]}`,
    name: zos.name || pkg.name,
    version: pkg.version || '1.0.0',
    description: zos.description || pkg.description,
    author: pkg.author,
    category: zos.category || 'other',
    icon: zos.icon,
    permissions: zos.permissions || [],
    repository: `https://github.com/${fullName}`,
    homepage: pkg.homepage,
    window: zos.window,
  };
}

/**
 * Get CDN URL for an app bundle
 */
function getCDNUrl(repoName: string, version: string): string {
  // Use jsDelivr for GitHub repos
  return `https://cdn.jsdelivr.net/gh/zos-apps/${repoName}@${version}/dist/index.js`;
}

/**
 * Load an app dynamically from CDN
 */
export async function loadApp(identifier: string): Promise<LoadedApp> {
  // Check cache
  if (appCache.has(identifier)) {
    return appCache.get(identifier)!;
  }

  const registry = await fetchRegistry();
  const entry = registry.apps[identifier];

  if (!entry) {
    throw new Error(`App not found: ${identifier}`);
  }

  // Dynamic import from CDN
  let module: { default?: ComponentType<AppProps> };
  try {
    module = await import(/* @vite-ignore */ entry.cdn);
  } catch (error) {
    // Fallback: try loading from raw GitHub
    const fallbackUrl = entry.cdn.replace('cdn.jsdelivr.net/gh', 'raw.githubusercontent.com');
    module = await import(/* @vite-ignore */ fallbackUrl);
  }

  const component = module.default;
  if (!component) {
    throw new Error(`App ${identifier} does not export a default component`);
  }

  const loadedApp: LoadedApp = {
    manifest: entry.manifest,
    component,
    source: 'zos-apps',
  };

  appCache.set(identifier, loadedApp);
  return loadedApp;
}

/**
 * Preload an app (fetch but don't render)
 */
export async function preloadApp(identifier: string): Promise<void> {
  await loadApp(identifier);
}

/**
 * Clear app cache
 */
export function clearCache(): void {
  appCache.clear();
  registryCache = null;
  registryCacheTime = 0;
}

/**
 * Get all available apps from registry
 */
export async function getAvailableApps(): Promise<AppManifest[]> {
  const registry = await fetchRegistry();
  return Object.values(registry.apps).map(entry => entry.manifest);
}

/**
 * Check if an app is cached/loaded
 */
export function isAppLoaded(identifier: string): boolean {
  return appCache.has(identifier);
}
