# zOS

A web-based operating system experience built with React, TypeScript, and modern web technologies.

[![CI/CD](https://github.com/z-os4/os/actions/workflows/ci.yml/badge.svg)](https://github.com/z-os4/os/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@z-os/apps.svg)](https://www.npmjs.com/package/@z-os/apps)

**[Live Demo](https://z-os4.github.io/os/)** | **[Documentation](#apps-catalog)**

## Features

- macOS-inspired desktop environment
- 36 built-in applications
- Window management with drag, resize, minimize, maximize
- Spotlight search (⌘+Space)
- Dock with app launching and running indicators
- Dark mode optimized UI
- Hanzo AI, Lux Wallet, and Zoo ecosystem integration

## Quick Start

```bash
# Clone the repository
git clone https://github.com/z-os4/os.git
cd os

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Packages

| Package | Description | npm |
|---------|-------------|-----|
| [@z-os/core](packages/core) | Core hooks, contexts, and utilities | [![npm](https://img.shields.io/npm/v/@z-os/core.svg)](https://www.npmjs.com/package/@z-os/core) |
| [@z-os/ui](packages/ui) | UI components (windows, menus, controls) | [![npm](https://img.shields.io/npm/v/@z-os/ui.svg)](https://www.npmjs.com/package/@z-os/ui) |
| [@z-os/apps](packages/apps) | 36 built-in applications | [![npm](https://img.shields.io/npm/v/@z-os/apps.svg)](https://www.npmjs.com/package/@z-os/apps) |
| [@z-os/sdk](packages/sdk) | SDK for building zOS apps | [![npm](https://img.shields.io/npm/v/@z-os/sdk.svg)](https://www.npmjs.com/package/@z-os/sdk) |
| [@z-os/apps-loader](packages/apps-loader) | Dynamic app loading system | [![npm](https://img.shields.io/npm/v/@z-os/apps-loader.svg)](https://www.npmjs.com/package/@z-os/apps-loader) |

## Apps Catalog

### Core Apps

| App | Description | Features |
|-----|-------------|----------|
| **Finder** | File Manager | Browse files, folders, favorites, tags |
| **Safari** | Web Browser | Tabs, bookmarks, history, URL bar |
| **Mail** | Email Client | Inbox, compose, folders, search |
| **Photos** | Photo Library | Albums, memories, favorites, editing |
| **Calendar** | Calendar | Month/week/day views, events, reminders |
| **Messages** | Messaging | Conversations, attachments, search |
| **FaceTime** | Video Calls | HD video, audio calls, favorites |
| **Music** | Music Player | Library, playlists, now playing, queue |
| **Terminal** | Command Line | Shell, history, themes, vim mode |
| **TextEdit** | Text Editor | Rich text, markdown, code highlighting |

### Productivity Apps

| App | Description | Features |
|-----|-------------|----------|
| **Notes** | Note Taking | Folders, rich text, checklists, search |
| **Reminders** | Tasks & Reminders | Lists, due dates, priorities, tags |
| **Stickies** | Sticky Notes | Color-coded notes, always visible |
| **Contacts** | Address Book | Contact cards, groups, favorites |
| **Freeform** | Whiteboard | Drawing, shapes, text, collaboration |
| **Translate** | Translation | 12+ languages, text & voice, history |

### Media Apps

| App | Description | Features |
|-----|-------------|----------|
| **Podcasts** | Podcast Player | Library, episodes, queue, downloads |
| **Books** | E-Book Reader | Library, reading progress, bookmarks |
| **News** | News Aggregator | Categories, saved articles, trending |
| **Voice Memos** | Audio Recorder | Record, playback, transcription |
| **Preview** | Document Viewer | PDFs, images, annotations |

### Navigation

| App | Description | Features |
|-----|-------------|----------|
| **Maps** | Maps & Directions | Search, favorites, directions, layers |

### System Apps

| App | Description | Features |
|-----|-------------|----------|
| **System Preferences** | Settings | Appearance, display, sound, network |
| **Calculator** | Calculator | Basic, scientific, programmer modes |
| **Clock** | World Clock | Multiple timezones, alarms, stopwatch |
| **Weather** | Weather Forecast | Current, hourly, 7-day forecast |
| **Activity Monitor** | System Monitor | CPU, memory, disk, network stats |
| **Console** | System Logs | Log viewer, filtering, search |
| **Disk Utility** | Disk Management | Drive info, partitions, health |
| **Font Book** | Font Manager | Preview, install, organize fonts |
| **Passwords** | Password Manager | Secure storage, generator, autofill |

### Reference & Finance

| App | Description | Features |
|-----|-------------|----------|
| **Dictionary** | Dictionary | Definitions, thesaurus, examples |
| **Stocks** | Stock Market | Watchlist, charts, news, statistics |

### Hanzo Ecosystem

| App | Description | Features |
|-----|-------------|----------|
| **Hanzo AI** | AI Assistant | Chat, code help, image generation |
| **Lux Wallet** | Crypto Wallet | Multi-chain, send/receive, DeFi |
| **Zoo** | Zoo Labs | NFTs, governance, community |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘ + Space` | Open Spotlight Search |
| `⌘ + Tab` | App Switcher |
| `⌘ + W` | Close Window |
| `⌘ + Q` | Quit App |
| `⌘ + ,` | Open Preferences |
| `⌘ + Option + Esc` | Force Quit Dialog |

## Architecture

```
z-os4/
├── apps/
│   └── shell/          # Main desktop shell application
├── packages/
│   ├── core/           # Core hooks and contexts
│   │   ├── useWindowManager - Window state management
│   │   ├── useDesktopSettings - Theme, wallpaper settings
│   │   ├── DockProvider - Dock state management
│   │   └── TerminalProvider - Terminal emulator
│   ├── ui/             # Reusable UI components
│   │   ├── ZWindow - macOS-style window
│   │   ├── WindowTitleBar - Title bar with controls
│   │   └── WindowControls - Traffic light buttons
│   ├── apps/           # 36 built-in applications
│   ├── sdk/            # App development SDK
│   │   ├── ZOSApp - App wrapper component
│   │   ├── useSDK - SDK hooks
│   │   └── App manifest types
│   └── apps-loader/    # Dynamic app loading
└── .github/
    └── workflows/      # CI/CD pipelines
```

## Development

### Prerequisites

- Node.js 20+
- pnpm 9+

### Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Build all packages
pnpm typecheck    # Run TypeScript checks
pnpm test         # Run tests
pnpm clean        # Clean build artifacts
```

### Building an App

```tsx
import { ZWindow } from '@z-os/ui';

export const MyApp = ({ onClose, onFocus }) => (
  <ZWindow
    title="My App"
    onClose={onClose}
    onFocus={onFocus}
    defaultWidth={600}
    defaultHeight={400}
  >
    <div>Hello from My App!</div>
  </ZWindow>
);

// With SDK features
import { ZOSApp, useSDK } from '@z-os/sdk';

const manifest = {
  identifier: 'com.example.myapp',
  name: 'My App',
  version: '1.0.0',
};

export default function MyApp({ onClose }) {
  return (
    <ZOSApp manifest={manifest} onClose={onClose}>
      <MyAppContent />
    </ZOSApp>
  );
}

function MyAppContent() {
  const { app, notifications } = useSDK();
  return (
    <div>
      <h1>{app.manifest.name}</h1>
      <button onClick={() => notifications.show({ title: 'Hello!' })}>
        Notify
      </button>
    </div>
  );
}
```

## Deployment

### GitHub Pages

The shell app is automatically deployed to GitHub Pages on every push to `main`.

### npm Publishing

Packages are automatically published to npm when a version tag is pushed:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Required secrets:
- `NPM_TOKEN`: npm automation token with publish access

## Bundle Sizes

| Package | Size (gzip) |
|---------|-------------|
| @z-os/core | ~4 KB |
| @z-os/ui | ~23 KB |
| @z-os/sdk | ~36 KB |
| @z-os/apps | ~347 KB |
| @z-os/apps-loader | ~2 KB |

## License

MIT

## Credits

Built with:
- [React](https://react.dev)
- [TypeScript](https://typescriptlang.org)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://framer.com/motion)
- [Lucide Icons](https://lucide.dev)
- [Radix UI](https://radix-ui.com)

Part of the [Hanzo AI](https://hanzo.ai) ecosystem.
