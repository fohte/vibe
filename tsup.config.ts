import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  target: 'node22',
  outDir: 'dist',
  clean: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
  minify: false,
  sourcemap: true,
})
