import { defineConfig, mergeConfig } from 'vitest/config'
// @ts-ignore
import viteConfig from './vite.config.mts'

export default mergeConfig(
  await viteConfig,
  defineConfig({
    test: {
      environment: 'happy-dom',
      coverage: {
        provider: 'istanbul',
        reporter: ['text', 'lcov'],
        include: ['src/**/*.ts', 'src/**/*.vue'],
        exclude: ['src/main.ts', 'src/plugins/**', 'src/typed-router.d.ts'],
      },
    },
  }),
)
