export type MessageJSON = {
    id: string
    content: string
    isBot: boolean
    isPending?: boolean
}


export interface User {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    full_name: string;
    uuid: string;
    faculty_status: string;
    is_administrator: boolean;
    is_not_gdpr_location: boolean;
    contact_infos: Array<{
        type: string;
        value: string;
        is_verified: boolean;
        is_guessed_preferred: boolean;
    }>;
}


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

export const DEFAULT_MODEL = 'quiz'

export const CHATIDPARAM = 'chatId'
