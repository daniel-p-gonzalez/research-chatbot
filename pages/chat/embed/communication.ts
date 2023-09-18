import { useEffect, useState } from 'react'
import { connectToParent, AsyncMethodReturns } from 'penpal'
import type { ParentApi, ChildApi, BookContext } from '../../../src/api'

export const useEmbedCommunication = (): [ParentApi | null, BookContext | null] => {
    const [ api, setParent ] = useState<AsyncMethodReturns<ParentApi> | null>(null)
    const [ context, setContext ] = useState<BookContext | null>(null)

    useEffect(() => {
        connectToParent<ParentApi>({
            methods: {
                setBookContext(context) { setContext(context) }
            } satisfies ChildApi,
        }).promise.then(function (parent): void {
            setParent(parent)
        })
    }, [])

    return [api, context]
}
