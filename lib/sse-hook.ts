import type { SSChatUpdate, ChatMessageReply, MessageSendContext } from './types'
import { fetchEventSource } from '@microsoft/fetch-event-source'

export type MsgUpdateCB = {
    initial: (msg: ChatMessageReply) => void,
    message: (msg: SSChatUpdate) => void,
    error: (errorMessage: string) => void,
}

export const sendMsgAndListen = async (context: MessageSendContext, cb: MsgUpdateCB) => {
    const controller = new AbortController()

    fetchEventSource(`/api/chat/message`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
            "Accept": 'text/event-stream',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(context),
        onmessage(msg) {
            try {
                const data = JSON.parse(msg.data)

                if (data.transcript) {
                    cb.initial(data)
                } else if (data.error) {
                    cb.error(data.error)
                } else if (data.msgId) {
                    cb.message(data)
                } else {
                    throw new Error(`Unknown message type: ${msg.data}`)
                }
            }
            catch (err: any) {
                console.warn(`Error: ${err.message} parsing payload: ${msg.data}`)
            }

        }
    })

    return

    // const sse = new SSEFetcher(`/api/chat/message`, {
    //     method: 'POST',
    //     signal: controller.signal,
    //     headers: {
    //         "Accept": 'text/event-stream',
    //         'Content-Type': 'application/json',
    //         'Cache-Control': 'no-cache',
    //     },
    //     body: JSON.stringify(context),
    // })

    // while (sse.isReading) {
    //     const m = await sse.nextMessage();
    //     console.log(m);
    //     try {
    //         const data = JSON.parse(m.data)

    //         if (data.transcript) {
    //             cb.initial(data)
    //         } else if (data.error) {
    //             cb.error(data.error)
    //         } else if (data.msgId) {
    //             cb.message(data)
    //         } else {
    //             throw new Error(`Unknown message type: ${m.data}`)
    //         }
    //     }
    //     catch (err: any) {
    //         console.warn(`Error: ${err.message} parsing payload: ${m.data}`)
    //     }
    // }

    // // Later, stop events & close the connection.
    // sse.close();
}
