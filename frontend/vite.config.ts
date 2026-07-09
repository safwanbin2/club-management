import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const srcPath = path.resolve(dirname, 'src')

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 700
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': srcPath,
      '@common': path.resolve(srcPath, 'common'),
      '@components': path.resolve(srcPath, 'components'),
      '@config': path.resolve(srcPath, 'config'),
      '@features': path.resolve(srcPath, 'components/features'),
      '@icons': path.resolve(srcPath, 'icons'),
      '@pages': path.resolve(srcPath, 'pages'),
      '@resource': path.resolve(srcPath, 'resource'),
      '@utilities': path.resolve(srcPath, 'components/utilities')
    }
  }
})
