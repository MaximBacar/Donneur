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
      "9362-132-205-229-6.ngrok-free.app" // Your ngrok URL
    ],
  },
});
