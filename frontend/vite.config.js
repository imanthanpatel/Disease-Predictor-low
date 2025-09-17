import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy FastAPI endpoints during local dev so backend isn't required locally
      '/meta': {
        target: process.env.VITE_API_BASE || 'https://disease-predictor-low.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/predict': {
        target: process.env.VITE_API_BASE || 'https://disease-predictor-low.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
