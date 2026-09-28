import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Geliştirmede arayüz Vite'tan (5173), veri mock sunucudan (8002) gelir.
// Uçlar göreli adresle çağrılır; üretimde dist/ zaten 8002'den servis edilir.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/state': 'http://localhost:8002',
      '/events': 'http://localhost:8002',
      '/control': 'http://localhost:8002',
    },
  },
})
