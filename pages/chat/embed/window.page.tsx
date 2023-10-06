import { useEffect, PropsWithChildren, useState } from 'react'
import 'iframe-resizer'
import { ChatPanel } from '#components/chat/chat-panel'

import { useEmbedCommunication } from './communication'

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
    return <>{children}</>
}

export const withoutGTM = true

export const Page = () => {
    const [api, context] = useEmbedCommunication()

    if (!context || !api) {
        return null
    }

console.log(context)
    return (
        <ChatPanel
            height="100vh"
            subject={context.subject}
            topic={context.title}
            isOpen={true}
            onClose={api.onClose}
        />
    )
}
