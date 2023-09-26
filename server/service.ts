import { InferenceContext } from '#lib/types'
import type { SavedChatModel, SavedMessageModel } from './data'
import { RequestContext } from './request-context'


export const inferenceForChat = async (chat: SavedChatModel, message: SavedMessageModel, ctx: RequestContext) => {
    if (ctx.model == 'self-hosted' || ctx.model == 'quiz') {
        const { inferenceForChat } = await import('./service.fastchat.js')
        return inferenceForChat(chat, message, ctx)
    }
    const { inferenceForChat } = await import('./service.together.js')
    return inferenceForChat(chat, message, ctx)
}



export const requestInference = async (ctx: InferenceContext) => {
    let requestInference: null | ((ctx: InferenceContext) => Promise<AbortController | void>) = null

    if (ctx.model == 'self-hosted' || ctx.model == 'quiz') {
        requestInference = (await import('./service.fastchat.js')).requestInference
    } else if (ctx.model.match(/^openai/)) {
        requestInference = (await import('./service.openai.js')).requestInference
    } else if (ctx.model.match(/^together/)) {
        requestInference = (await import('./service.together.js')).requestInference
    }
    if (!requestInference) {
        throw new Error(`unknown model ${ctx.model} requested`)
    }
    return await requestInference(ctx)
}


export type PromiseifiedInferenceContext = Omit<InferenceContext, 'onProgress' | 'onComplete'> & {

}

export const infer = async (ctx: PromiseifiedInferenceContext): Promise<string> => {
    return new Promise(onComplete => {
        requestInference({
            ...ctx,
            onProgress() {  }, // NOOP
            onComplete(content) {
                onComplete(content)
            },
        })
    })
}
