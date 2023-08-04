import type { Express } from 'express'
import type { SavedChatModel, SavedMessageModel } from './data'
import type { ChatUpdatesQueue } from './chat-updates'
import type { OnProgressCB, OnCompleteCB } from './types'
import { RequestContext } from './request-context'

export const requestInference = async (chat: SavedChatModel, message: SavedMessageModel, ctx: RequestContext) => {
    const { requestInference } = await import('./service.together.js')
    return requestInference(chat, message, ctx)
}


export const installWebhookHandler = async (app: Express, chatUpdates: ChatUpdatesQueue) => {

}


// export const requestInference = async (chat: SavedChatModel, message: MessageModel) => {
//     const { requestInference } = await import('./service.replicate')
//     return requestInference(chat, message)
// }

// export const installWebhookHandler = async (app: Express, chatUpdates: ChatUpdatesQueue) => {
//     const { installWebhookHandler } = await import('./service.replicate')
//     return await installWebhookHandler(app, chatUpdates)
// }
