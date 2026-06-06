import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import packageJson from './package.json'

const isExtension = process.env.BUILD_TARGET === 'extension';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: isExtension ? './' : '/',
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version),
    'import.meta.env.IS_EXTENSION': JSON.stringify(isExtension),
  },
  ...(isExtension && {
    build: {
      outDir: 'CycloneDX_Editor_Extension',
      rollupOptions: {
        input: { main: 'index.html' },
      },
    },
  }),
})
