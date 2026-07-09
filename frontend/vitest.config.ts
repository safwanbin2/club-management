import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'

import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      css: true,
      environment: 'jsdom',
      globals: true,
      passWithNoTests: true,
      setupFiles: './src/test/setup.ts'
    }
  })
)
