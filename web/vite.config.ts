/// <reference types="vitest" />
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { PluginOption, defineConfig } from 'vite'
import { ManifestOptions, VitePWA } from 'vite-plugin-pwa'

const manifest: Partial<ManifestOptions> = {
  name: 'mChat',
  short_name: 'mchat',
  background_color: '#fff',
  description: 'Real time messenger powered by Socket.IO',
  lang: 'en',
  theme_color: '#000',
  icons: [{ src: '/vite.svg', sizes: '32x32', type: 'image/svg' }],
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({ gzipSize: true, brotliSize: true }) as PluginOption,
    VitePWA({ registerType: 'autoUpdate', manifest }),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
  test: {
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {},
    environment: 'jsdom',
  },
})
