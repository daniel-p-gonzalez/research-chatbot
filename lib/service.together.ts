import { SavedMessageModel, SavedChatModel, Message, messagesForChatId } from './data'
import { RequestContext } from './request-context'
import { getParamStoreValue } from './aws'
import { DEFAULT_MODEL } from './types'

class CompletedError extends Error {  }

// import type { Express } from 'express'
// import type { ChatUpdatesQueue } from './chat-updates'
//import { chatUpdates } from './chat-updates'
import { buildPrompt } from './prompts'
import { IS_PROD } from './env'
// using vs @microsoft/fetch-event-source' until https://github.com/Azure/fetch-event-source/pull/28#issuecomment-1421976714
import { fetchEventSource } from 'fetch-event-source-hperrin'

const MAX_ATTEMPTS = 3

type Choices = { choices: { text: string }[] }

const MODELS: Record<string, string> = {
    'llama-2-7b': 'togethercomputer/llama-2-7b-chat',
    'llama-2-13b': 'togethercomputer/llama-2-13b-chat',
    'llama-2-70b': 'togethercomputer/llama-2-70b-chat',
    'vicuna-13b': 'lmsys/vicuna-13b-v1.3',
}


export const requestInference = async (
    chat: SavedChatModel, message: SavedMessageModel, ctx: RequestContext,
) => {
    const controller = new AbortController()
    const messages = await messagesForChatId(chat.id)
    let attempts = 0
    const prompt = buildPrompt(messages)
    console.log(ctx, prompt)

    let token = process.env.TOGETHER_AI_API_TOKEN
    if (IS_PROD && !token) {
        token = await getParamStoreValue('together-ai-api-token')
    }
    if (!token) throw new Error("No token for together.ai")

    const response = fetchEventSource('https://api.together.xyz/inference', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
            prompt,
            model: MODELS[ctx.model || DEFAULT_MODEL] || MODELS[DEFAULT_MODEL],
            max_tokens: 512,
            temperature: 0.7,
            top_p: 0.7,
            stop: ['<Student>:'],
            top_k: 50,
            repetition_penalty: 1,
            stream_tokens: true,
        }),
        onmessage(chunk) {
            console.log(chat.id, chunk.data)
            if (chunk.data == '[DONE]') {
                ctx.onComplete()
                controller.abort()
                throw new CompletedError()
            }
            const msg = JSON.parse(chunk.data) as Choices
            const content = msg.choices[0].text
                .replace(/^(\r\n|\r|\n)*<?TutorBot>?:(\r\n|\r|\n)*/i, '')
                .replace(/(\r\n|\r|\n){2,}/, '\n\n')

            message.content += message.content.length ? content : content.trimStart()

            Message.update(message)
            ctx.onProgress({
                msgId: message.id,
                content: message.content,
                isPending: true,
            })

        },
        onerror(err) {
            if (attempts > MAX_ATTEMPTS || err instanceof CompletedError) {
                throw err // do not retry
            } else {
                attempts += 1
            }
        },
        onclose() {
            if (message.content.length) { // we've got at least some content
                ctx.onComplete()
            }
        }
    }).catch(err => {
        if (err instanceof CompletedError) {
            return
        } else {
            console.warn("ERROR", err)
        }
    })


    return response


    if (!response.ok) {
        const status = await response.text()
        try {
            const data = JSON.parse(status)
            ctx.onComplete(data.error || data.message || status)
        }
        catch {
            ctx.onComplete(status)
        }
        return
    }

    if (!response.body) {
        ctx.onComplete(`No Body.  status: ${await response.text()}`)
        return
    }


    for await (const incoming of response.body) {

        let chunk = ""
        console.log(`${ctx.chatId}: ${String(incoming)}`)

        for (const line of String(incoming).split(/(\r\n|\r|\n){2}/g)) {
            const content = line.trim()
            if (content.length) {
                chunk += content
            } else {
                await parseChunk(chunk, message, ctx)
                chunk = ''
            }

        }

    }

}
