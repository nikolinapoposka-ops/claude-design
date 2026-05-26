import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
const agentationNoop = {
  name: 'agentation-noop-prod',
  resolveId(id: string) {
    if (id === 'agentation' && process.env.NODE_ENV !== 'development') {
      return '\0agentation-noop';
    }
    return null;
  },
  load(id: string) {
    if (id === '\0agentation-noop') {
      return 'export const Agentation = () => null;';
    }
    return null;
  },
};

export default defineConfig({
  plugins: [react(), agentationNoop],
  resolve: {
    alias: {
      // @quinyx/ui ships with a pnpm-hoisted path for style-inject; remap to npm-installed location
      'style-inject/dist/style-inject.es.js': path.resolve(
        __dirname,
        'node_modules/style-inject/dist/style-inject.es.js'
      ),
    },
  },
  server: {
    allowedHosts: true,
  },
})
