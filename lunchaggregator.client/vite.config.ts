import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

export default defineConfig({
    plugins: [react()],
    server: {
        https: {
            key: fs.readFileSync(`${__dirname}/../cert/key.pem`),
            cert: fs.readFileSync(`${__dirname}/../cert/cert.pem`)
        },
      port: 3000,
      proxy: {
        '/api': {
            target: 'http://localhost:5000',
            changeOrigin: true,
        }
      }
    }
})
