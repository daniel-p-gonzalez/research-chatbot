import serverless from 'serverless-http'
import express from 'express'
import type { MessageSendContext } from '#lib/types'
import { RequestContext } from './request-context.js'


function server() {

    const app = express()

    app.get('/api/admin/chats', async (req, res) => {
        const { chatsBetweenDates } = await import('#server/conversation.js')
        const chats = await chatsBetweenDates(req.query.start as string, req.query.end as string)
        res.json(chats)
    })

    app.post('/api/chat/fetch-messages', async (req, res) => {
        const { chatId } = JSON.parse(req.body)
        const { findChat, chatTranscript } = await import('#server/conversation.js')

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

    return app

}

export const handler = serverless(server())
