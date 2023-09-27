import { SavedMessageModel, SavedChatModel, Message, messagesForChatId } from './data'
import { RequestContext } from './request-context'
import { getConfigValue, FASTCHAT_API_URL } from './config'
import { fetchEventSource } from 'fetch-event-source-hperrin'
import { PROMPT_TEXT_SUFFIX } from './prompts'
import { InferenceMessage, InferenceContext } from '#lib/types'

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


function messageForPrompt<M extends InferenceMessage>(m: M) {
    return (m.isBot ? 'TUTORBOT: ' : 'STUDENT: ') + m.content
}

const inputOnOpen: any = () => null


export async function requestInference(ctx: InferenceContext) {
    const controller = new AbortController()
    const { buildPrompt, cleanMessageContent } = await import('./prompts')

    const prompt = buildPrompt(ctx, ctx.transcript.length == 0) +
        ctx.transcript.map(messageForPrompt).join('\n\n') +
        ctx.message + '\n\n' + PROMPT_TEXT_SUFFIX

    const token = await getConfigValue('together-ai-api-token')

    let content = ''
    let attempts = 0

//    console.log(ctx, prompt)

    await fetchEventSource(FASTCHAT_API_URL, {
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
        inputOnOpen, // needed bc fastchat sends invalid content-type header of application/json vs streaming
        onmessage(chunk) {
//            console.log(chunk.data)
            if (chunk.data == '[DONE]') {
                ctx.onComplete(content.trim())
                controller.abort()
                throw new CompletedError()
            }
            const msg = JSON.parse(chunk.data) as Chunk
            const chunkTxt = msg.choices[0].delta.content

            if (!chunkTxt) return

            content += content.length ? chunkTxt : chunkTxt.trimStart()

            content = cleanMessageContent(content)

            ctx.onProgress(content)
        },
        onerror(err) {
            if (attempts > MAX_ATTEMPTS || err instanceof CompletedError) {
                throw err // do not retry
            } else {
                attempts += 1
            }
        },
        onclose() {
            if (content.length) { // we've got at least some content
                ctx.onComplete(content)
            }
        }
    }).catch(err => {
        if (err instanceof CompletedError) {
            return
        } else {
            console.warn("ERROR", err)
        }
    })
    return controller
}

export const inferenceForChat = async (
    chat: SavedChatModel, message: SavedMessageModel, ctx: RequestContext,
) => {
    const transcript = (await messagesForChatId(chat.id)).slice(0, -2)

    return requestInference({
        ...ctx,
        transcript,
        onComplete(content) {
            message.content = content
            Message.update(message)
            ctx.onComplete()
        },
        onProgress(content) {
            message.content = content
            Message.update(message)
            ctx.onProgress({ msgId: message.id, content, isPending: true })
        }
    })

}
