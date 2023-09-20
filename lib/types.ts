 export type TranscriptMessage = {
    id: string
    content: string
    isBot: boolean
    model?: string
    occurred: string
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

export type ChatWithTranscript = {
    id: string,
    model?: string
    transcript: TranscriptMessage[]
}

export type ChatMessageReply = ChatWithTranscript & {
    error?: string
}

export type  OnProgressCB = (msg: SSChatUpdate) => void

export type OnCompleteCB =  (errorMessage?: string) => void

export type ChatWithFirstMessage = {
    id: string,
    occurred: string
    message: string
}


export type MessageSendContext = {
    chatId:string
    message: string
    topic: string
    model: string
    subject: string
}

export const DEFAULT_MODEL = 'self-hosted'

export const CHATIDPARAM = 'chatId'

export type InferenceMessage = {
    content: string
    isBot: boolean
}
