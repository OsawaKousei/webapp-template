import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // コンテナ外からのアクセスを許可
    port: 5173,
    fs: {
      // 親ディレクトリ（packages/types等）にあるファイルの読み込みを許可
      allow: ['..']
    }
  }
})
