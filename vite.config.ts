import react from '@vitejs/plugin-react'
import ssr from 'vite-plugin-ssr/plugin'
import { UserConfig } from 'vite'

const config: UserConfig = {
  plugins: [
        react(),
        ssr({ prerender: true }),
    ],
    build: {
        rollupOptions: {
            output: {
                // assetFileNames: 'assets/asset-[name]-[hash].[ext]',
                // chunkFileNames: 'assets/chunk-[name]-[hash].js',
                // entryFileNames: 'assets/entry-[name]-[hash].js',
            },
        }
    }
}

export default config
