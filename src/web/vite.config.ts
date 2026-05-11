import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/forge/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // 内容哈希作为版本号，确保 CDN 缓存失效
        assetFileNames: 'static/[name]-[hash][extname]',
        chunkFileNames: 'static/[name]-[hash].js',
        entryFileNames: "static/[name]-v2-[hash].js",
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
