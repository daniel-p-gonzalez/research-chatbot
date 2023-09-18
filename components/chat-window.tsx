import { css } from '@emotion/css'
import { ChatPanel, ChatPanelProps } from './chat-panel'
import { createPortal } from 'react-dom'
import { Rnd } from 'react-rnd'

type ChatWindowProps = ChatPanelProps & {

}


export const ChatWindow: React.FC<ChatWindowProps> = ({ ...props }) => {
    if (!props.isOpen) return null

    return createPortal((
        <Rnd default={{
            x: window.innerWidth - 470,
            y: 20,
            width: 450,
            height: window.innerHeight - 40,
        }}
            minWidth="350px"
            minHeight="450px"
            dragHandleClassName='header'
        >
            <ChatPanel {...props} className={css({ '.header': { cursor: 'grab' } })}/>
        </Rnd>
    ), document.body)

}
