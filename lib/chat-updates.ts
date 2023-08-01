import { SSChatUpdate } from './types.js'
import type { MessageModel } from './data.js'

export class ChatUpdatesQueue {

    constructor() {
        console.log('NEW UPDATE Q')
    }

    store: Record<string, SSChatUpdate[]> = {}

    push(chatId: string, isPending: boolean, msg: MessageModel) {
        const queue = this.store[chatId] = (this.store[chatId] || [])
        queue.push({
            msgId: msg.id || '',
            isPending,
            content: msg.content,
        })
    }

    updates(chatId: string) {
        return this.store[chatId] || []
    }

    clearUpdates(chatId: string) {
        this.store[chatId] = []
    }

}


const chatUpdates = new ChatUpdatesQueue()

export { chatUpdates }
