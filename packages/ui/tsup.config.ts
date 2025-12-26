import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'window/index': 'src/window/index.ts',
    'dock/index': 'src/dock/index.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', '@zos/core'],
  treeshake: true,
});
