import react from '@vitejs/plugin-react'
import ssr from 'vike/plugin'
import { UserConfig } from 'vite'

const config: UserConfig = {
  plugins: [
        react(),
        ssr({
            prerender: true,
        }),
    ],
    resolve: {
        alias: {
            '#lib': '/lib',
            '#components': '/components',
            '#server': '/server',
        }
    },
    build: {
        emptyOutDir: false, // clearing will delete embed build in assets
    },
}

export default config
