import { OnProgressCB, OnCompleteCB, MessageSendContext, DEFAULT_MODEL } from '../lib/types'


export class RequestContext implements MessageSendContext {

    onProgress: OnProgressCB
    onComplete: OnCompleteCB

    readonly subject!: string
    readonly topic!: string
    readonly chatId!: string
    readonly message!: string
    readonly model = DEFAULT_MODEL

    constructor(onProgress: OnProgressCB, onComplete: OnCompleteCB, ctx: MessageSendContext) {
        this.onProgress = onProgress
        this.onComplete = onComplete

        Object.assign(this, ctx)
    }

}
