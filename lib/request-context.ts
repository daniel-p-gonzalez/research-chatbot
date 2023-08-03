import type { OnProgressCB, OnCompleteCB, RequestContextOptions } from './types'


export class RequestContext {

    onProgress: OnProgressCB

    onComplete: OnCompleteCB
    options: RequestContextOptions

    constructor(onProgress: OnProgressCB, onComplete: OnCompleteCB, options: RequestContextOptions) {
        this.onProgress = onProgress
        this.onComplete = onComplete
        this.options = options
    }

}
