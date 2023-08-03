import type { Express } from 'express'
import type { SavedChatModel, SavedMessageModel } from './data'
import type { ChatUpdatesQueue } from './chat-updates'
import type { OnProgressCB, OnCompleteCB } from './types'

export const requestInference = async (chat: SavedChatModel, message: SavedMessageModel, onProgress: OnProgressCB, onComplete: OnCompleteCB) => {
    const { requestInference } = await import('./service.together.js')
    return requestInference(chat, message, onProgress, onComplete)
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
