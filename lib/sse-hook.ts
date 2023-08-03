import { useEffect } from 'react'
import type { SSChatUpdate, ChatMessageReply } from './types'

export type MsgUpdateCB = {
    initial: (msg: ChatMessageReply) => void,
    message: (msg: SSChatUpdate) => void,
    error: (errorMessage: string) => void,
}

export const sendMsgAndListen = (chatId:string, message: string, cb: MsgUpdateCB) => {
    const controller = new AbortController()

    fetch(`/api/chat/message`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
            "Accept": "text/event-stream",
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
            chatId , message,
        }),
    }).then(async (response) => {

        if (!response.ok || !response.body) {
            throw Error(response.statusText);
        }

        for (const reader = response.body.getReader(); ;) {
            const { value, done } = await reader.read();

            if (done) {
                break;
            }

            const chunk = new TextDecoder().decode(value);

            const subChunks = chunk.split(/(?<=})\n\ndata: (?={)/);

            for (const subChunk of subChunks) {
                const payload = subChunk.replace(/^data: /, "")
                const data = JSON.parse(payload)

                if (data.transcript) {
                    cb.initial(data)
                } else if (data.error) {
                    cb.error(data.error)
                } else if (data.msgId){
                    cb.message(data)
                } else {
                    throw new Error(`Unknown message type: ${payload}`)
                }
            }
        }
    });

}

export const useSSEUpdates = (chatId:string, cb: MsgUpdateCB) => {

    useEffect(() => {
        console.log({ chatId })

        if (!chatId) return

        const evtSource = new EventSource(`/api/stream/${chatId}`);
        evtSource.onmessage = (e) => {
            cb(JSON.parse(e.data))
        };
        evtSource.onopen = (e) => {
            console.log(e)
        };
        evtSource.onerror = (e) => {
            console.log(e)
        };

        // fetch(`/api/stream/${chatId}`, {
        //     signal: controller.signal,
        //     headers: {
        //         "Accept": "text/event-stream",
        //     },
        // }).then(async (response) => {

        //     if (!response.ok || !response.body) {
        //         throw Error(response.statusText);
        //     }

        //     for (const reader = response.body.getReader(); ;) {
        //         const { value, done } = await reader.read();

        //         if (done) {
        //             break;
        //         }

        //         const chunk = new TextDecoder().decode(value);
        //         console.log(chunk)
        //         //const subChunks = chunk.split(/(?<=})\n\ndata: (?={)/);

        //         // for (const subChunk of subChunks) {
        //         //     const payload = subChunk.replace(/^data: /, "");
        //         //     document.body.innerText = JSON.parse(payload).chunk;
        //         // }
        //     }
        // });

        return () => {
            evtSource.close()
            // controller.abort()
        }
    }, [chatId, cb])
}
