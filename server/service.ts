import type { Express } from 'express'
import type { SavedChatModel, SavedMessageModel } from './data'
import type { ChatUpdatesQueue } from './chat-updates'
import { RequestContext } from './request-context'

export const requestInference = async (chat: SavedChatModel, message: SavedMessageModel, ctx: RequestContext) => {
    console.log({ model: ctx.model })

    if (ctx.model == 'quiz') {
        const { requestInference } = await import('./service.fastchat.js')
        return requestInference(chat, message, ctx)
    }
    const { requestInference } = await import('./service.together.js')
    return requestInference(chat, message, ctx)
}


export const installWebhookHandler = async (app: Express, chatUpdates: ChatUpdatesQueue) => {

}
