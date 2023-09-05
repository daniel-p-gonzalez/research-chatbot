import type { OnProgressCB, OnCompleteCB, MessageSendContext } from '#lib/types'


export class RequestContext implements MessageSendContext {

    onProgress: OnProgressCB
    onComplete: OnCompleteCB

    readonly subject!: string
    readonly topic!: string
    readonly chatId!: string
    readonly message!: string
    readonly model?: string

    constructor(onProgress: OnProgressCB, onComplete: OnCompleteCB, ctx: MessageSendContext) {
        this.onProgress = onProgress
        this.onComplete = onComplete

        Object.assign(this, ctx)
    }

}
