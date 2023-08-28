import { SavedMessageModel, SavedChatModel, Message, messagesForChatId } from './data'
import { RequestContext } from './request-context'
import { getParamStoreValue } from './aws'
import fetch from 'node-fetch'


import { IS_PROD } from './env'


type Chunk = {
    id: string
    model: string
    choices: Array<{
        index: number
        message: {
            role: string
            content: string
        }
    }>
    finish_reason: null | string
}

type TutorBotReply = {
    "Thoughts of Tutorbot": string
    "Evaluation of Student Response": string
    "Action Based on Evaluation": string
    "Subproblem State": string
    "Subproblem": string
    "Tutorbot": string
}

export const requestInference = async (
    chat: SavedChatModel, message: SavedMessageModel, ctx: RequestContext,
) => {
    const controller = new AbortController()
    const messages = await messagesForChatId(chat.id)

    // const { buildPrompt } = await import('./prompts')
    // const prompt = buildPrompt(ctx, messages)
    // console.log(ctx, prompt)
    let token = process.env.TOGETHER_AI_API_TOKEN // yes just copied same token
    if (IS_PROD && !token) {
        token = await getParamStoreValue('together-ai-api-token')
    }
    if (!token) throw new Error("No token for together.ai")

    const response = await fetch('https://luffy-chat.staging.kinetic.openstax.org/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
            messages: messages.map(m => ({ role: m.isBot ? 'assistant' : 'user', content: m.content })),
            model: 'nash-vicuna-33b-v1dot3-ep2-w-rag-w-simple',
            max_tokens: 512,
            temperature: 0.7,
            top_p: 0.7,
            top_k: 50,
            repetition_penalty: 1,
            //stream: true,
        })
    })

    console.log(response.ok)

    const json = await response.json() as Chunk
    let msg: string = json.choices[0].message.content
    try {
         msg = (JSON.parse(json.choices[0].message.content) as TutorBotReply).Tutorbot
    } catch {}

    console.log(JSON.stringify(json))

    message.content = msg

    Message.update(message)
    ctx.onProgress({ msgId: message.id, content: message.content, isPending: false })
    ctx.onComplete()
}
