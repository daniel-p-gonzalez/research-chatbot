// This file isn't processed by Vite, see https://vikejs/vike/issues/562
// Consequently:
//  - When changing this file, you needed to manually restart your server for your changes to take effect.
//  - To use your environment variables defined in your .env files, you need to install dotenv, see https://vike.dev/env
//  - To use your path aliases defined in your vite.config.js, you need to tell Node.js about them, see https://vike.dev/path-aliases

import express from 'express'
import compression from 'compression'
import { renderPage } from 'vike/server'
import 'dotenv/config'
import { root } from './root.js'
import { RequestContext } from './request-context.js'
import type { MessageSendContext } from '#lib/types'


startServer()

async function startServer() {
    const app = express()
    app.use(express.text())
    app.use(express.json())

    // Express is only used in dev, in prod lambda's are used
    // We instantiate Vite's development server and integrate its middleware to our server.
    // We instantiate it only in development. (It isn't needed in production and it
    // would unnecessarily bloat our server in production.)
    const viteImp = await import('vite')
    const vite = await viteImp.createServer({
        root,
        server: {
            hmr: {
                clientPort: 24678,
            },
            middlewareMode: true,
        }
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

        const chat = await addMessageToChat(new RequestContext(
            (updated) => {
                res.write('data: ' + JSON.stringify(updated) + '\n\n');
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

    app.post('/api/chat/feedback', async (req, res) => {
        const { chatId } = req.body
        const { findChat, chatTranscript } = await vite.ssrLoadModule('#server/conversation.ts', { fixStacktrace: true })
        const chat = await findChat(chatId)
        res.json({
            ...chat,
            transcript: await chatTranscript(chat)
        })
        // res.status(200).send()
    })

    app.post('/api/chat/like', async (req, res) => {
        res.status(200)
    })

    app.post('/api/chat/dislike', async (req, res) => {
        res.status(200)
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

    app.get('*', async (req, res, next) => {
        const pageContextInit = {
            urlOriginal: req.originalUrl
        }
        const pageContext = await renderPage(pageContextInit)
        const { httpResponse } = pageContext
        if (!httpResponse) return next()
        const { body, statusCode, headers, earlyHints } = httpResponse
        if (res.writeEarlyHints) res.writeEarlyHints({ link: earlyHints.map((e) => e.earlyHintLink) })
        res.status(statusCode)
        headers.forEach(([name, value]) => res.setHeader(name, value))
        res.send(body)
    })

    const port = process.env.PORT || 3000
    app.listen(port)
    console.log(`Server running at http://localhost:${port}`)
}
