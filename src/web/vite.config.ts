import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/forge/',  // ← 改成子目录的绝对路径（注意前后斜杠）
  build: {
    outDir: 'dist',
    // emptyOutDir: true,
    // rollupOptions: {
    //   output: {
    //     // 内容哈希作为版本号，确保 CDN 缓存失效
    //     assetFileNames: 'assets/[name]-[hash][extname]',
    //     chunkFileNames: 'assets/[name]-[hash].js',
    //     entryFileNames: "assets/[name]-v2-[hash].js",
    //   },
    // },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
