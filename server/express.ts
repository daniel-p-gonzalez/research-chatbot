// This file isn't processed by Vite, see https://github.com/brillout/vite-plugin-ssr/issues/562
// Consequently:
//  - When changing this file, you needed to manually restart your server for your changes to take effect.
//  - To use your environment variables defined in your .env files, you need to install dotenv, see https://vite-plugin-ssr.com/env
//  - To use your path aliases defined in your vite.config.js, you need to tell Node.js about them, see https://vite-plugin-ssr.com/path-aliases

import express from 'express'
import compression from 'compression'
import { renderPage } from 'vite-plugin-ssr/server'
import 'dotenv/config'
import { root } from './root.js'
import type { MessageSendContext } from '#lib/types'
import { installWebhookHandler } from './service.js'
import { RequestContext } from './request-context.js'


startServer()

async function startServer() {
    const app = express()
    app.use(express.text())
    app.use(express.json())
    app.use(compression())

    const { chatUpdates } = await import('./chat-updates.js')

    // Express is only used in dev, in prod lambda's are used
    // We instantiate Vite's development server and integrate its middleware to our server.
    // We instantiate it only in development. (It isn't needed in production and it
    // would unnecessarily bloat our server in production.)
    const viteImp = await import('vite')
    const vite = await viteImp.createServer({
        root,
        server: { middlewareMode: true }
    })

    app.use(vite.middlewares)


    app.post('/api/chat/message', async (req, res) => {
        console.log('Received message', req.body)
        const ctx = req.body as MessageSendContext
        res.writeHead(200, {
            "Connection": "keep-alive",
            "Cache-Control": "no-cache",
            "Content-Type": "text/event-stream",
        })

        const { addMessageToChat, chatTranscript  } = await vite.ssrLoadModule('#server/conversation.ts', { fixStacktrace: true })
console.log(addMessageToChat)
        const chat = await addMessageToChat(new RequestContext(
            (updated) => {
                res.write('data: ' + JSON.stringify(updated) + '\n\n');
                res.flush()
            },
            (errorMsg?: string) => {
                if (errorMsg) {
                    res.write('data: ' + JSON.stringify({ error: errorMsg }) + '\n\n');
                }
                res.end()
            },
            ctx,
        ))

        res.write('data: ' + JSON.stringify({
            id: chat.id,
            transcript: await chatTranscript(chat)
        }) + '\n\n');
    })

    app.get('/api/admin/chats', async (req, res) => {
        const { chatsBetweenDates } = await vite.ssrLoadModule('#server/conversation.ts', { fixStacktrace: true })
        res.json({ chats: await chatsBetweenDates(req.query.start, req.query.end) })
    })

    app.post('/api/chat/fetch-messages', async (req, res) => {
        const { chatId } = req.body
        const { findChat, chatTranscript } = await vite.ssrLoadModule('#server/conversation.ts', { fixStacktrace: true })

        try {
            const chat = await findChat(chatId)
            res.json({
                ...chat,
                transcript: await chatTranscript(chat)
            })
        } catch (e) {
            console.log(e)
            res.status(404).send('Not found')
        }
    })

    await installWebhookHandler(app, chatUpdates)


    app.get('*', async (req, res, next) => {
        const pageContextInit = {
            urlOriginal: req.originalUrl
        }
        const pageContext = await renderPage(pageContextInit)
        const { httpResponse } = pageContext
        if (!httpResponse) return next()
        const { body, statusCode, contentType, earlyHints } = httpResponse
        if (res.writeEarlyHints) res.writeEarlyHints({ link: earlyHints.map((e) => e.earlyHintLink) })
        res.status(statusCode).type(contentType).send(body)
    })

    const port = process.env.PORT || 3000
    app.listen(port)
    console.log(`Server running at http://localhost:${port}`)
}
