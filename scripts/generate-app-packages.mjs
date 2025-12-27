#!/usr/bin/env node
/**
 * Generate individual npm packages for each zOS app
 */

import { readdir, mkdir, writeFile, readFile, cp } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const APPS_SRC = join(ROOT, 'packages/apps/src');

const apps = [
  'activity-monitor', 'books', 'calculator', 'calendar', 'clock', 'console',
  'contacts', 'dictionary', 'disk-utility', 'facetime', 'finder', 'font-book',
  'freeform', 'hanzo-ai', 'lux', 'mail', 'maps', 'messages', 'music', 'news',
  'notes', 'passwords', 'photos', 'podcasts', 'preview', 'reminders', 'safari',
  'settings', 'stickies', 'stocks', 'terminal', 'textedit', 'translate',
  'voice-memos', 'weather', 'zoo'
];

const toTitleCase = (str) => str.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

async function generateAppPackage(appName) {
  const pkgDir = join(ROOT, 'packages', `app-${appName}`);
  const srcDir = join(pkgDir, 'src');

  // Create directories
  await mkdir(srcDir, { recursive: true });

  // Copy source file
  const srcFile = join(APPS_SRC, appName, 'index.tsx');
  await cp(srcFile, join(srcDir, 'index.tsx'));

  // Generate package.json
  const packageJson = {
    name: `@z-os/app-${appName}`,
    version: '1.0.0',
    type: 'module',
    main: './dist/index.js',
    module: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': {
        import: './dist/index.js',
        types: './dist/index.d.ts'
      }
    },
    scripts: {
      build: 'tsup',
      typecheck: 'tsc --noEmit'
    },
    peerDependencies: {
      react: '^18.0.0',
      'react-dom': '^18.0.0'
    },
    dependencies: {
      '@z-os/core': 'workspace:*',
      '@z-os/ui': 'workspace:*',
      '@z-os/sdk': 'workspace:*',
      'lucide-react': '^0.468.0'
    },
    devDependencies: {
      '@types/react': '^18.3.0',
      '@types/react-dom': '^18.3.0',
      tsup: '^8.5.1',
      typescript: '^5.7.2'
    },
    zos: {
      identifier: `ai.hanzo.${appName.replace(/-/g, '')}`,
      name: toTitleCase(appName),
      category: 'apps'
    }
  };

  await writeFile(join(pkgDir, 'package.json'), JSON.stringify(packageJson, null, 2) + '\n');

  // Generate tsconfig.json
  const tsconfig = {
    extends: '../../tsconfig.json',
    compilerOptions: {
      outDir: './dist',
      rootDir: './src'
    },
    include: ['src/**/*']
  };

  await writeFile(join(pkgDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2) + '\n');

  // Generate tsup.config.ts
  const tsupConfig = `import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
});
`;

  await writeFile(join(pkgDir, 'tsup.config.ts'), tsupConfig);

  console.log(`✓ Generated @z-os/app-${appName}`);
}

async function main() {
  console.log('Generating individual app packages...\n');

  for (const app of apps) {
    await generateAppPackage(app);
  }

  console.log(`\n✓ Generated ${apps.length} app packages`);
}

main().catch(console.error);
