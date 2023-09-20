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
    if (ctx.model == 'self-hosted' || ctx.model == 'quiz') {
        const { requestInference } = await import('./service.fastchat.js')
        return requestInference(ctx)
    }
    const { requestInference } = await import('./service.together.js')
    return requestInference(ctx)
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
