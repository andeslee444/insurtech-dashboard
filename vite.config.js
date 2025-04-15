import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Specify the base directory for relative paths
  base: '/',
  // Configure server options
  server: {
    // Enable open on startup
    open: true,
  },
  // Configure build options
  build: {
    // Output directory for production build
    outDir: 'dist',
    // Enable source maps
    sourcemap: true,
  },
  // Configure asset handling
  assetsInclude: ['**/*.json'],
  // Specify the public directory
  publicDir: 'public',
}); 