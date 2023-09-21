import { createPortal } from 'react-dom'
import { Rnd } from 'react-rnd'
import { css } from '@emotion/css'
import { ChatPanel, ChatPanelProps } from './chat-panel'

export const ChatWindow = ({ ...props }: ChatPanelProps) => {
    if (!props.isOpen) return null
    return createPortal((
        <Rnd default={{
                x: window.innerWidth - 470,
                y: 20,
                width: 450,
                height: window.innerHeight - 40,
            }}
            minWidth={320}
            minHeight={540}
            dragHandleClassName='header'
        >
            <ChatPanel {...props} className={css({ '.header': { cursor: 'grab' } })}/>
        </Rnd>
    ), document.body)

}
