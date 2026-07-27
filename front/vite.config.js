import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  server: {
    port: 8081,
    proxy: {
      '/springboot35l3z': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // 后端未启动时，返回 mock 数据避免页面白屏
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('[proxy] 后端未启动，API 请求将失败，前端仍可显示静态页面')
          })
        }
      }
    }
  }
})
