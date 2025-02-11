import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  server: {
    host: true,  // Allow external access
    strictPort: true,  // Prevent random port selection
    port: 5173,  // Ensure it matches your ngrok port
    allowedHosts: [
      "0e53-2607-fa49-ad41-de00-e1d8-4212-5c84-263d.ngrok-free.app" // Your ngrok URL
    ],
  },
});
