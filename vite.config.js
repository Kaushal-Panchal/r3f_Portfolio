import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'node:fs'

// Dev only: the poster page (?poster) POSTs its PNG here. Set POSTER_OUT to a path.
function posterSink() {
  return {
    name: 'poster-sink',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__poster', (req, res) => {
        const out = process.env.POSTER_OUT
        if (req.method !== 'POST' || !out) {
          res.statusCode = 404
          return res.end()
        }
        let body = ''
        req.on('data', (c) => (body += c))
        req.on('end', () => {
          writeFileSync(out, Buffer.from(body.replace(/^data:image\/png;base64,/, ''), 'base64'))
          res.end('ok')
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), posterSink()],
  build: {
    target: 'es2020',
    assetsInlineLimit: 4096,
    modulePreload: { polyfill: false },
    // three.js plus R3F is one lazy chunk of about 217 KB gzip; it is never on the critical path.
    chunkSizeWarningLimit: 850,
  },
})
