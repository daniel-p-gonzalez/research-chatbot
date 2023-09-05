import { SavedMessageModel, SavedChatModel, Message, messagesForChatId } from './data'
import { RequestContext } from './request-context'
import { getConfigValue } from './config'
import type { MessageModel } from './data'
import { fetchEventSource } from 'fetch-event-source-hperrin'
import { PROMPT_TEXT_SUFFIX } from './prompts'

class CompletedError extends Error {  }
const MAX_ATTEMPTS = 3

type Chunk = {
    id: string
    model: string
    choices: Array<{
        index: number
        delta: {
            role: string
            content?: string
        }
    }>
    finish_reason: null | string
}


export const messageForPrompt = (m: MessageModel) => {
    return (m.isBot ? 'TUTORBOT: ' : 'STUDENT: ') + m.content
}

const inputOnOpen: any = () => null

export const requestInference = async (
    chat: SavedChatModel, message: SavedMessageModel, ctx: RequestContext,
) => {
    const controller = new AbortController()
    const messages = await messagesForChatId(chat.id)

    const token = await getConfigValue('together-ai-api-token')

    const saveAndStream = (msg: SavedMessageModel, isPending = true) => {
        Message.update(msg)
        ctx.onProgress({ msgId: message.id, content: message.content, isPending })
    }

    let attempts = 0
    const { buildPrompt } = await import('./prompts')

    const prompt = buildPrompt(ctx, messages) +
        'Your previous conversation is:\n\n' +
        messages.slice(0, -1).map(messageForPrompt).join('\n\n') +
        '\n\n' + PROMPT_TEXT_SUFFIX

    console.log(ctx, prompt)

    await fetchEventSource('https://luffy-chat.staging.kinetic.openstax.org/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
            messages: prompt,
            // model: 'nash-vicuna-13b-v1dot5-ep2-w-rag-w-simple',
            model: 'nash-vicuna-33b-v1dot3-ep2-w-rag-w-simple',
            max_tokens: 512,
            temperature: 0.7,
            top_p: 0.7,
            top_k: 50,
            repetition_penalty: 1,
            stream: true,
        }),
        // @ts-ignore
        inputOnOpen, // needed bc fastchat sends invalid header
        onmessage(chunk) {
            console.log(chat.id, chunk.data)
            if (chunk.data == '[DONE]') {
                message.content = message.content.trim()
                saveAndStream(message)
                ctx.onComplete()
                controller.abort()
                throw new CompletedError()
            }
            const msg = JSON.parse(chunk.data) as Chunk
            const content = msg.choices[0].delta.content

            if (!content) return

            message.content += message.content.length ? content : content.trimStart()

            message.content = message.content
                .replace(/^(\r\n|\r|\n)*<?TutorBot>?:(\r\n|\r|\n)*/gi, '')
                .replace(/(\r\n|\r|\n){2,}/g, '\n\n')

            saveAndStream(message)
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

    // console.log(response.ok)

    // const json = await response.json() as Chunk
    // let msg: string = json.choices[0].message.content
    // try {
    //      msg = (JSON.parse(json.choices[0]?.message?.content) as TutorBotReply).Tutorbot
    // } catch(e) {
    //     console.log(`CAUGHT, msg was:\n${json.choices[0]?.message?.content}`)
    //     console.warn(e)
    // }

    // console.log(JSON.stringify(json))

    // message.content = msg

    // Message.update(message)
    // ctx.onProgress({ msgId: message.id, content: message.content, isPending: false })
    // ctx.onComplete()
}
