import { SavedMessageModel, SavedChatModel, Message, messagesForChatId } from './data'
import fetch from 'node-fetch'
// import type { Express } from 'express'
// import type { ChatUpdatesQueue } from './chat-updates'
//import { chatUpdates } from './chat-updates'
import { buildPrompt } from './prompts'

const TOKEN = process.env.TOGETHER_AI_API_TOKEN || ''
const LINE_REGEX = /data: .*?\n\n/
type Choices = { choices: { text: string }[] }
type Reply = { output: Choices }

async function parseChunk(chunk: string, chat: SavedChatModel, message: SavedMessageModel) {
    const { chatUpdates } = await import('./chat-updates.js')

    const data = chunk.substring(chunk.trimEnd().indexOf(':') + 1).trimStart()

    if (!data.length) return

    console.log(`data: ${data}--EOD`)
    if (data.match(/^\s*\[DONE\]/)) {
        message.content = message.content.trimEnd()
        chatUpdates.push(chat.id, false, message)
    } else {
        const msg = JSON.parse(data) as Choices
        const content = msg.choices[0].text
            .replace(/^(\r\n|\r|\n)*<?TutorBot>?:(\r\n|\r|\n)*/i, '')

        message.content += message.content.length ? content : content.trimStart()

        Message.update(message)
        chatUpdates.push(chat.id, true, message)
    }
}

export const requestInference = async (chat: SavedChatModel, message: SavedMessageModel) => {

    const messages = await messagesForChatId(chat.id)

    const prompt = buildPrompt(messages)
console.log(prompt)
    const response = await fetch('https://api.together.xyz/inference', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt,
            model: "togethercomputer/llama-2-7b-chat", // 70b-chat", // 13b-chat",
            max_tokens: 512,
            temperature: 0.7,
            top_p: 0.7,
            stop: ['<Student>:'],
            top_k: 50,
            repetition_penalty: 1,
            stream_tokens: true,
        }),
    })

    if (!response.ok)
        throw new Error(await response.text());

    if (!response.body) return //throw new Error("no body")


    for await (const incoming of response.body) {

        let chunk = ""
        //console.log(`chunk: ${String(incoming)}----ENDOCHUHC`)

        for (const line of String(incoming).split(/(\r\n|\r|\n){2}/g)) {
            const content = line.trim()
            if (content.length) {
                chunk += content
            } else {
                await parseChunk(chunk, chat, message)
                chunk = ''
            }

        }

    }

}
