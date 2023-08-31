export type MessageJSON = {
    id: string
    content: string
    isBot: boolean
    isPending?: boolean
}

// export type Message = {
//     uuid: string
//     isBot?: boolean
//     message: string
//     prefixed: string
//     asJson: MessageJSON
// }

export const WelcomeMessage = 'Hello, I’m TutorBot. How can I help you?'

// export type ChatStore = {
//     uuid: string
//     messagesForPrompt: Message[]
//     messages: Record<string, Message>
// }

export type SSChatUpdate = {
    msgId: string
    isPending: boolean
    content: string,
}

export type ChatMessageReply = {
    id: string,
    transcript: MessageJSON[],
    error?: string
}

export type  OnProgressCB = (msg: SSChatUpdate) => void

export type OnCompleteCB =  (errorMessage?: string) => void


export type MessageSendContext = {
    chatId:string
    message: string
    topic: string
    subject: string
    model?: string
}

// export type RequestContextOptions = {
//     chatId: string
//     message: string
//     model?: string
// }

export const DEFAULT_MODEL = 'quiz'

export const CHATIDPARAM = 'chatId'
