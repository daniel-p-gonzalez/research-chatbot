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
import { installWebhookHandler } from '../lib/service.js'
import { RequestContext } from '../lib/request-context.js'
const isProduction = process.env.NODE_ENV === 'production'


startServer()

async function startServer() {
    const app = express()
    app.use(express.text())
    app.use(express.json())
    app.use(compression())

    const { chatUpdates } = await import('../lib/chat-updates.js')

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
        const ctx = req.body as MessageSendContext
        res.writeHead(200, {
            "Connection": "keep-alive",
            "Cache-Control": "no-cache",
            "Content-Type": "text/event-stream",
        })

        const { addMessageToChat, chatTranscript  } = await vite.ssrLoadModule('#lib/conversation.ts')

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

    app.post('/api/chat/fetch-messages', async (req, res) => {
        const { chatId } = req.body
        const { findChat, chatTranscript } = await vite.ssrLoadModule('#lib/conversation.ts')
        try {
            const chat = await findChat(chatId)
            res.json({
                id: chat.id,
                transcript: await chatTranscript(chat)
            })
        } catch (e) {
            res.status(404).send('Not found')
        }
    })

    // app.get("/api/stream/:chatId", (req, res) => {
    //     const { chatId } = req.params
    //     res.writeHead(200, {
    //         "Connection": "keep-alive",
    //         "Cache-Control": "no-cache",
    //         "Content-Type": "text/event-stream",
    //     })

    //     const interval = setInterval(() => {
    //         const updates = chatUpdates.updates(chatId)
    //         if (updates.length) {
    //             for (const update of updates) {
    //                 res.write('data: ' + JSON.stringify(update) + '\n\n');
    //             }
    //             res.flush()
    //             chatUpdates.clearUpdates(chatId) // n.b. this will clear for ALL clients, but I think that's ok since chat's are one per user
    //         }
    //     }, 1000)

    //     res.on("close", () => {
    //         clearInterval(interval);
    //         res.end();
    //     })
    // })

    installWebhookHandler(app, chatUpdates)

    // app.post('/api/webhook/replicate/:chatId/:msgId', async (req, res) => {
    //     const { body, params: { chatId, msgId } } = req

    //     const { Conversation } = await import('../lib/conversation.js')
    //     const chat = Conversation.get(chatId)
    //     const msg = chat?.getBotMessage(msgId)
    //     if (msg) {
    //         const { fetchPrediction } = await import('../lib/service.replicate.js')
    //         const prediction = await fetchPrediction(body.id)

    //         console.log({ body, prediction })

    //         msg.message = prediction.output?.join(' ') || ''
    //         msg.isPending = prediction.status != 'succeeded'

    //         sseUpdates.push(chatId, msg.contentForUpdate)

    //     } else {
    //         console.warn(`Recieved webhook for non-existing ${!!chat ? 'message' : 'chat'} ${chatId} : ${msgId} ${!!chat}`)
    //     }
    //     res.status(200).send('ok')
    // })
    // ...
    // Other middlewares (e.g. some RPC middleware such as Telefunc)
    // ...
    // Vite-plugin-ssr middleware. It should always be our last middleware (because it's a
    // catch-all middleware superseding any middleware placed after it).
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
