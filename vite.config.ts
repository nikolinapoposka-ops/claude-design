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
      '@quinyx/ui': path.resolve(__dirname, './src/lib/quinyx-ui.tsx'),
    },
  },
})
