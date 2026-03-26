import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss()
    ],
    server: {
        host: true, // Listen on all network interfaces
        // https: true, // Handled by basicSsl plugin
        port: 5173,
        allowedHosts: [
            'mariana-unperpetuable-nonfeverishly.ngrok-free.dev',
            '.ngrok-free.dev',
            '.ngrok-free.app',
            '.ngrok-free.io'
        ], // Allow ngrok tunnels
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true
            },
            '/socket.io': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                ws: true
            }
        }
    }
})
