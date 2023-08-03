import Replicate from "replicate";
import { MessageModel, SavedChatModel, Message, Chat, messagesForChatId } from './data'
import fetch from 'node-fetch'
import type { Express } from 'express'
import type { ChatUpdatesQueue } from './chat-updates'

import { buildPrompt } from './prompts'


const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN || '',
    fetch,
})


export const fetchPrediction = async (id: string) => {
    return await replicate.predictions.get(id)
}

export const requestInference = async (
    chat: SavedChatModel, message: MessageModel, onProgress: OnProgressCB, onComplete: OnCompleteCB,
) => {
    const messages = await messagesForChatId(chat.id)

    console.log(messages)

    const version = "6282abe6a492de4145d7bb601023762212f9ddbbe78278bd6771c8b3b2f2a13b"
    // "2c1608e18606fad2812020dc541930f2d0495ce32eee50074220b87300bc16e1"
    //replicate/llama-2-70b-chat:2c1608e18606fad2812020dc541930f2d0495ce32eee50074220b87300bc16e1"

    const prompt = buildPrompt(messages)

    console.log(prompt)

    // const input = { prompt: "an astronaut riding a horse on mars, hd, dramatic lighting, detailed" };
    const prediction = await replicate.predictions.create({
        version,
        stream: true,
        webhook: `${process.env.WEBHOOK_URL}/api/webhook/replicate/${chat.id}/${message.id}`,
        input: {
            prompt,
        }
    });


    if (prediction?.urls?.stream) {
        const source = new EventSource(prediction.urls.stream, { withCredentials: true });

        source.addEventListener("output", (e) => {
            console.log("output", e.data);
        //    message.message = e.data
        });

        source.addEventListener("error", (e: any) => {
            console.error("error", JSON.parse(e.data));
        });

        source.addEventListener("done", (e) => {
            source.close();
            console.log("done", JSON.parse(e.data));
        });
    }//   else {
    //     console.log({ prediction })
    //     const response = await replicate.predictions.get(prediction.id)
    //     console.log(response)
    // }
}
export const installWebhookHandler = async (app: Express, chatUpdates: ChatUpdatesQueue) => {

    return app.post('/api/webhook/replicate/:chatId/:msgId', async (req, res) => {
        const { body, params: { chatId, msgId } } = req

        /* const { Conversation } = await import('./conversation.js') */
        const chat = await Chat.get({ id: chatId })

        const msg = await Message.get({ id: msgId })
        if (chat && msg) {
           // const { fetchPrediction } = await import('../lib/service.replicate.js')
            const prediction = await fetchPrediction(body.id)

            //console.log({ body, prediction })

            msg.content = prediction.output?.join(' ') || ''

            console.log({ chatId, msgId, content: msg.content })

            Message.update(msg)

            chatUpdates.push(chatId, prediction.status != 'succeeded', msg)


        } else {
            //console.log(Object.keys(Conversation.ALL))
            console.warn(`Recieved webhook for non-existing chat/message ${chatId} : ${msgId} (chat ${!!chat})`)
        }
        res.status(200).send('ok')
    })
}
