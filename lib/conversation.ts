import { requestInference } from './service'
import { Chat, Message, SavedMessageModel, messagesForChatId } from './data'
import type { SavedChatModel, MessageModel } from './data'
import type { MessageJSON,  OnProgressCB, OnCompleteCB } from './types'
import { RequestContext } from './request-context'


export async function addMessageToChat(
    chatId: string, content: string, context: RequestContext
)  {

    const chat = await( chatId ? Chat.get({ id: chatId }) : Chat.create({ }) )

    if (!chat?.id) throw new Error(`Conversation for ${chatId} was not found`)

    await Message.create({ chatId: chat.id, content })

    const botMsg = await Message.create({ chatId: chat.id, content: '', isBot: true })

    requestInference(chat as SavedChatModel, botMsg, context)
    return chat as SavedChatModel
}

export function messageForTranscript(msg: MessageModel): MessageJSON {
    return {
        id: msg.id || '', content: msg.content, isBot: !!msg.isBot, isPending: (msg.isBot && !msg.content),
    }
}

export async function findChat(chatId: string ) {
    const chat = await Chat.get({ id: chatId })
    if (chat?.id) return chat as SavedChatModel

    throw new Error(`Conversation for ${chatId} was not found`)
}

export async function chatTranscript(chat: SavedChatModel) {
    const messages = await messagesForChatId(chat.id)
    return messages.map(messageForTranscript)
}


// import crypto from 'crypto'
// import type { MessageJSON, SSEventUpdate } from './types'

// class BaseMessage implements Message {
//     message: string
//     isPending = false
//     uuid: string

//     constructor(message = '') {
//         this.message = message
//         this.uuid = crypto.randomUUID()
//     }
//     get asJson(): MessageJSON {
//         return { id: this.uuid, content: this.message, bot: false }
//     }
//     get prefixed() { return '' }
// }

// class StudentMessage extends BaseMessage {
//     get prefixed(): string {
//         return `Student:\n${this.message}`
//     }
// }



// class BotMessage extends BaseMessage {
//     readonly isBot = true
//     isPending = true
//     // constructor() {
//     //     super('yes')
//     // }
//     get asJson() {
//         const json = super.asJson
//         return { ...json, bot: true }
//     }
//     get prefixed(): string {
//         return `TutorBot:\n${this.message}`
//     }
//     get contentForUpdate(): SSEventUpdate {
//         return { msgId: this.uuid, isPending: this.isPending, content: this.message }
//     }

// }


// export class OldConversation implements ChatStore {
//     messages: Record<string, Message> = { }
//     uuid: string

//     static append(uuid: string | null, message: string) {
//         const chat = uuid ? Conversation.ALL[uuid] : new Conversation()
//         if (!chat) throw new Error(`Conversation for ${uuid} was not found`)
//         chat.addstudentMessage(message)
//         return chat
//     }

//    // static get(uuid: string) { return ConversationModel.[uuid] }

//     constructor() {
//         this.uuid = crypto.randomUUID()
//         Conversation.ALL[this.uuid] = this
//     }

//     getBotMessage(uuid: string) {
//         const msg = this.messages[uuid]
//         return msg?.isBot ? msg as BotMessage : null
//     }

//     addstudentMessage(txt: string) {
//         const msg = new StudentMessage(txt)
//         this.messages[msg.uuid] = msg

//         const botMsg = new BotMessage()
//         //requestInference(this, botMsg)

//         this.messages[botMsg.uuid] = botMsg
//     }

//     get transcript(): MessageJSON[] {
//         return (Object.values(this.messages) as Message[]).map(m => m.asJson)
//     }

//     get messagesForPrompt() {
//         return Object.values(this.messages).slice(1)
//     }

// }
