import { useEffect, PropsWithChildren, useState } from 'react'
import 'iframe-resizer'
import { LaunchIcon } from '#components/launch-icon'
import { Global, css } from '@emotion/react'
import { useEmbedCommunication } from './communication'

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
    return <>{children}</>
}



export const Page = () => {
    const [api] = useEmbedCommunication()

    const onClick = () => {
        api?.openNewFrame({
            name: 'chat-window',
            srcURL: `${window.location.origin}/chat/embed/window`,
            embedLocation: 'body',
            isResizable: true,
            isDraggable: true,
            fitContent: false,
            position: { top: '20px', right: '20px', height: 'calc(100vh - 40px)', width: '400px' }
        })
    }

    return (
        <>
            <Global
                styles={css({
                    '#react-root': { width: 150, maxWidth: 150 },
                })}
            />
            <LaunchIcon onClick={onClick} isOpen={false} />
        </>
    )
}
