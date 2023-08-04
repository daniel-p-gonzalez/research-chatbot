import type { SSChatUpdate, ChatMessageReply, MessageSendContext } from './types'
import { fetchEventSource } from '@microsoft/fetch-event-source'

export type MsgUpdateCB = {
    initial: (msg: ChatMessageReply) => void,
    message: (msg: SSChatUpdate) => void,
    error: (errorMessage: string) => void,
}
const MAX_ATTEMPTS = 3

class CompletedError extends Error {  }

export const sendMsgAndListen = async (context: MessageSendContext, cb: MsgUpdateCB) => {
    const controller = new AbortController()
    let attempts = 0
    let hasReplied = false
    fetchEventSource(`/api/chat/message`, {
        method: 'POST',

        headers: {
            "Accept": 'text/event-stream',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
        body: JSON.stringify(context),
        onmessage(msg) {
            console.log(msg)
            try {
                const data = JSON.parse(msg.data)

                if (data.transcript) {
                    cb.initial(data)
                } else if (data.error) {
                    cb.error(data.error)
                } else if (data.msgId) {
                    cb.message(data)
                    hasReplied = true
                } else {
                    throw new Error(`Unknown message type: ${msg.data}`)
                }
            }
            catch (err: any) {
                throw new Error(`${err.message} parsing payload: ${msg.data}`)
            }

        },
        onerror(err) {
            if (attempts > MAX_ATTEMPTS || err instanceof CompletedError) {
                controller.abort()
                throw err // do not retry
            } else {
                attempts += 1
            }
        },
        onclose() {
            if (hasReplied) { // we've got at least some content
                throw new CompletedError() // signal not to retry
            }
        }
    }).catch(err => {
        if (err instanceof CompletedError) {
            return
        } else {
            console.warn("ERROR", err)
        }
    })

}
