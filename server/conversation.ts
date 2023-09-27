import { inferenceForChat } from './service'
import { Chat, Message, createdAtCompare, messagesForChatId } from './data'
import type { SavedChatModel, MessageModel, SavedMessageModel } from './data'
import type { TranscriptMessage, ChatWithFirstMessage } from '#lib/types'
import { parseDate } from '#lib/util'
import { RequestContext } from './request-context'


export async function addMessageToChat(ctx: RequestContext)  {

    const chat = await( ctx.chatId ? Chat.get({ id: ctx.chatId }) : Chat.create({ model: ctx.model  }) )

    if (!chat?.id) throw new Error(`Conversation for ${ctx.chatId} was not found`)
    const c = chat as SavedChatModel

    await Message.create({ chatId: c.id, content: ctx.message })
    const botMsg = await Message.create({ chatId: c.id, content: '', isBot: true })  as SavedMessageModel

    inferenceForChat(c, botMsg, ctx)
    return c
}

export function messageForTranscript(msg: MessageModel): TranscriptMessage {
    return {
        id: msg.id || '', content: msg.content, isBot: !!msg.isBot,
        occurred: msg.created?.toISOString() || '',
    }
}

export async function findChat(chatId: string ) {
    const chat = await Chat.get({ id: chatId })
    if (!chat?.id) throw new Error(`Conversation for ${chatId} was not found`)

    return chat as SavedChatModel
}

export async function chatTranscript(chat: SavedChatModel) {
    const messages = await messagesForChatId(chat.id)
    return messages.map(messageForTranscript)
}

export async function findChats(chat: SavedChatModel) {
    const messages = await messagesForChatId(chat.id)
    return messages.map(messageForTranscript)
}

export async function chatsBetweenDates(st?: string, ed?: string) {
    const start = parseDate(st), end = parseDate(ed);
    let next: any = null
    const chats: ChatWithFirstMessage[] = []

    do {
        const allChats = await Chat.scan({}, { fields: ['id', 'created'] })
        for (const chat of allChats) {
            if (chat.created && chat.created >= start && chat.created <= end) {
                const c: SavedChatModel = chat as any
                const msgs = await Message.find({ chatId: c.id }, { index: 'gs1', fields: ['content', 'created'] })
                msgs.sort(createdAtCompare)
                chats.push({
                    id: c.id,
                    occurred: c.created?.toISOString() || '',
                    message: msgs[0]?.content || '',
                })
            }
        }
        next = allChats.next
    } while (next)
//    chats.sort(createdAtCompare)
    return chats

}
