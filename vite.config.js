/*
 * @作者：rocyuan（袁鹏）
 * @邮箱：roc@rocyuan.top、rocyuan666@163.com
 * @微信：rocyuan666
 * @个人网站：http://rocyuan.top
 */
import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vitePluginVueSetupExtend from 'vite-plugin-vue-setup-extend'

export default defineConfig(({ command, mode }) => ({
  base: mode === 'production' ? '/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  // 生产环境移除 console 与 debugger
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  server: {
    port: 8080,
    host: true,
    open: true,
    // 代理
    proxy: {
      '/api': {
        target: 'http://rocyuan.top:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [vue(), vueJsx(), vitePluginVueSetupExtend()],
}))
