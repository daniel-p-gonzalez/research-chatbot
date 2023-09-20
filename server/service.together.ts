import { SavedMessageModel, SavedChatModel, Message, messagesForChatId } from './data'
import { RequestContext } from './request-context'
import { getConfigValue } from './config'
import { InferenceMessage, InferenceContext } from '#lib/types'

class CompletedError extends Error {  }

// using vs @microsoft/fetch-event-source' until https://github.com/Azure/fetch-event-source/pull/28#issuecomment-1421976714
import { fetchEventSource } from 'fetch-event-source-hperrin'

const MAX_ATTEMPTS = 3

type Chunk = {
    choices: { text: string }[]
    token: {
        id: string
        logprob: number
        special?: boolean
    }
}

function messageForPrompt<M extends InferenceMessage>(m: M) {
    if (m.isBot) {
        return m.content
    }
    return `[INST] ${m.content}\n [/INST]`
}


export async function requestInference(ctx: InferenceContext) {
    const { buildPrompt, cleanMessageContent, PROMPT_INST_SUFFIX } = await import('./prompts')


    const prompt = buildPrompt(ctx, ctx.transcript.length == 0) + ctx.transcript.map(messageForPrompt).join('\n\n') + PROMPT_INST_SUFFIX

    const token = await getConfigValue('together-ai-api-token')
    const controller = new AbortController()
    let content = ''
    let attempts = 0
    fetchEventSource('https://api.together.xyz/api/inference', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
            prompt: ctx.message,
            model: ctx.model,
            prompt_format_string: prompt,
            max_tokens: 768,
            temperature: 0.7,
            top_p: 0.7,
            type: 'chat',
            stop: ['</s>:', '[INST'],
            top_k: 50,
            repetition_penalty: 1,
            stream_tokens: true,
        }),
        onmessage(chunk) {
            if (chunk.data == '[DONE]') {
                ctx.onComplete(content.trim())
                controller.abort()
                throw new CompletedError()
            }
            const msg = JSON.parse(chunk.data) as Chunk
            const chunkTxt = msg.choices[0].text

            if (msg.token.special) { // FIXME: determine what "special" means.  have emailed support
                content = chunkTxt
            } else {
                content += content.length ? chunkTxt : chunkTxt.trimStart()
            }
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

    // the last two messages will be the one we're
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

    // const controller = new AbortController()
    // const messages = await messagesForChatId(chat.id)
    // let attempts = 0

    // const { buildPrompt, cleanMessageContent, PROMPT_INST_SUFFIX } = await import('./prompts')

    // const prompt = buildPrompt(ctx, messages) + messages.slice(0, -2).map(messageForPrompt).join('\n\n') + PROMPT_INST_SUFFIX

    // console.log(ctx, prompt)

    // const token = await getConfigValue('together-ai-api-token')

    // const saveAndStream = (msg: SavedMessageModel, isPending = true) => {
    //     Message.update(msg)
    //     ctx.onProgress({ msgId: message.id, content: message.content, isPending })
    // }
    // const response = fetchEventSource('https://api.together.xyz/api/inference', {
    //     method: 'POST',
    //     headers: {
    //         Authorization: `Bearer ${token}`,
    //         'Content-Type': 'application/json',
    //     },
    //     signal: controller.signal,
    //     body: JSON.stringify({
    //         prompt: ctx.message,
    //         model: ctx.model,
    //         prompt_format_string: prompt,
    //         max_tokens: 768,
    //         temperature: 0.7,
    //         top_p: 0.7,
    //         type: 'chat',
    //         stop: ['</s>:', '[INST'],
    //         top_k: 50,
    //         repetition_penalty: 1,
    //         stream_tokens: true,
    //     }),
    //     onmessage(chunk) {
    //         console.log(chat.id, chunk.data)
    //         if (chunk.data == '[DONE]') {
    //             message.content = message.content.trim()
    //             saveAndStream(message)
    //             ctx.onComplete()
    //             controller.abort()
    //             throw new CompletedError()
    //         }
    //         const msg = JSON.parse(chunk.data) as Chunk
    //         const content = msg.choices[0].text

    //         if (msg.token.special) { // FIXME: determine what "special" means.  have emailed support
    //             message.content = content
    //         } else {
    //             message.content += message.content.length ? content : content.trimStart()
    //         }
    //         message.content = cleanMessageContent(message.content)

    //         saveAndStream(message)
    //     },
    //     onerror(err) {
    //         if (attempts > MAX_ATTEMPTS || err instanceof CompletedError) {
    //             throw err // do not retry
    //         } else {
    //             attempts += 1
    //         }
    //     },
    //     onclose() {
    //         if (message.content.length) { // we've got at least some content
    //             ctx.onComplete()
    //         }
    //     }
    // }).catch(err => {
    //     if (err instanceof CompletedError) {
    //         return
    //     } else {
    //         console.warn("ERROR", err)
    //     }
    // })

    // return response

}
