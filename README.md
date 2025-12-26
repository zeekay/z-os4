# z-os4

A modular, composable web-based operating system built with React.

## Architecture

```
packages/
  @zos/core       # Window manager, hooks, contexts, services
  @zos/ui         # UI components (ZWindow, Dock, etc.)
  @zos/sdk        # App development SDK
  @zos/apps-loader # Dynamic app loading from CDN

apps/
  shell           # Minimal shell app that composes everything
```

## Quick Start

```bash
pnpm install
pnpm dev
```

## Building

```bash
pnpm build
```

## Package Structure

### @zos/core
Core OS functionality:
- `useWindowManager` - Window state management
- `useDesktopSettings` - Theme, wallpaper, dock settings
- `useOverlays` - Modal/overlay management
- `DockContext` - Dock state
- `appLoader` - GitHub app loading service

### @zos/ui
UI components:
- `ZWindow` - Window component with titlebar, resize, etc.
- Dock components (DockItem, ApplicationsPopover, etc.)
- Icons and logos

### @zos/sdk
App development SDK:
- `ZOSApp` - App wrapper component
- Hooks: `useApp`, `useStorage`, `useNotifications`, etc.
- Types for app manifests

### @zos/apps-loader
Dynamic app loading:
- Load apps from zos-apps GitHub org via ESM CDN
- Registry caching
- Sandbox/error boundary

## Creating Apps

Apps are loaded dynamically from the `zos-apps` GitHub organization.

### App package.json

```json
{
  "name": "@zos-apps/my-app",
  "version": "1.0.0",
  "zos": {
    "id": "com.example.myapp",
    "name": "My App",
    "icon": "🚀",
    "category": "utilities",
    "permissions": ["storage.local"]
  }
}
```

### App Component

```tsx
import { ZOSApp, useApp } from '@zos/sdk';

export default function MyApp({ onClose }) {
  const { manifest } = useApp();

  return (
    <ZOSApp>
      <h1>{manifest.name}</h1>
      <button onClick={onClose}>Close</button>
    </ZOSApp>
  );
}
```

## License

MIT
