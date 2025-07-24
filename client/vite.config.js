import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // This might already be there
import tailwindcss from '@tailwindcss/vite' // Add this line

export default defineConfig({
  server: {
    port: 2001,
    host: true
  },
  plugins: [
    react(), // Keep existing plugins
    tailwindcss(), // Add the tailwindcss plugin
  ],
  define: {
    // This makes Vite embed a placeholder if VITE_API_BASE_URL is not set during build.
    // It's crucial for the runtime injection.
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
      process.env.URL || '__VITE_API_BASE_URL_PLACEHOLDER__'
    ),
  },
})