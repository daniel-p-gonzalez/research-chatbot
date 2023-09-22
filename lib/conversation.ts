import { inferenceForChat } from './service'
import { Chat, Message, messagesForChatId } from './data'
import type { SavedChatModel, MessageModel, SavedMessageModel } from './data'
import type { MessageJSON } from './types'
import { RequestContext } from './request-context'


export async function addMessageToChat(ctx: RequestContext)  {

    const chat = await( ctx.chatId ? Chat.get({ id: ctx.chatId }) : Chat.create({ }) )

    if (!chat?.id) throw new Error(`Conversation for ${ctx.chatId} was not found`)
    const c = chat as SavedChatModel

    await Message.create({ chatId: c.id, content: ctx.message })
    const botMsg = await Message.create({ chatId: c.id, content: '', isBot: true })  as SavedMessageModel

    inferenceForChat(c, botMsg, ctx)
    return c
}

export function messageForTranscript(msg: MessageModel): MessageJSON {
    return {
        id: msg.id || '', content: msg.content, isBot: !!msg.isBot, isPending: (msg.isBot && !msg.content),
    }
}

export async function findChat(chatId: string ) {
    const chat = await Chat.get({ id: chatId })
    //console.log({ chat })
    if (chat?.id) return chat as SavedChatModel

    throw new Error(`Conversation for ${chatId} was not found`)
}

export async function chatTranscript(chat: SavedChatModel) {
    const messages = await messagesForChatId(chat.id)
    return messages.map(messageForTranscript)
}


