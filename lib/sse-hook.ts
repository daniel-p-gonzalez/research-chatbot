import { useEffect } from 'react'
import type { SSChatUpdate } from './types'

export type MsgUpdateCB = (msg: SSChatUpdate) => void

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
