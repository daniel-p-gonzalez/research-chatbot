import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message as ChatMessage, MessageInput } from '@chatscope/chat-ui-kit-react';
import { navigate } from 'vite-plugin-ssr/client/router'
import { isBrowser } from '../../lib/util'
import { ChatMessageReply, WelcomeMessage, MessageJSON } from '../../lib/types'
import { useSSEUpdates, MsgUpdateCB, sendMsgAndListen } from '../../lib/sse-hook'
import { useState, useCallback, useEffect } from 'react'
import { Request } from '../../lib/request'
import { Link } from '../../renderer/Link'

import { usePageContext } from '../../renderer/usePageContext';

function makeMessage({ isFirst, isLast, message }: { index: number, isFirst: boolean, isLast: boolean, message: MessageJSON }) {

    return (
        <ChatMessage key={message.id} model={{
            position: isFirst ? 'single' : isLast ? 'last' : 'normal',
            direction: message.isBot ? 'incoming' : 'outgoing',
            message: message.content || '…',
            sentTime: "just now",
            sender: message.isBot ? 'TutorBot' : 'You',
        }} />

    )
}

export const Page = () => {
    const defaultChatId = isBrowser() ? window.location?.hash?.slice(1) || '' : ''

    const [chat, setChat] = useState<ChatMessageReply>({id: defaultChatId, transcript: []})

    useEffect(() => {
        if (chat.id) {
            Request<ChatMessageReply>(`/api/chat/${chat.id}`).then((reply) => {
                setChat(reply)
            })
        }
    }, [])

    const onSend = (message: string) => {
        const cc = chat; // create a local copy and use that, otherwise methods below will act on stale state
        sendMsgAndListen(cc.id, message, {
            initial: (newChat) => {
                if (!cc.id) {
                    history.pushState({}, '', `/chat#${newChat.id}`)
                }
                Object.assign(cc, newChat)
                setChat(newChat)
            },
            message: (update) => {
                const transcript = cc.transcript.map(msg => msg.id == update.msgId ? { ...msg, content: update.content } : msg)
                setChat({ ...cc, transcript })
            },
            error: (errorMsg) => {
                console.warn(errorMsg)
            },
        })
    }

    return (
        <div style={{ position: "relative", height: "500px" }}>
            {defaultChatId && <Link href="/chat">start new chat</Link>}
            <hr />
            <MainContainer>
                <ChatContainer>
                    <MessageList>
                        <ChatMessage model={{
                            position: chat.transcript.length ? 'normal' : 'single',
                            direction: 'incoming',
                            message: WelcomeMessage,
                            sentTime: "just now",
                            sender: 'TutorBot',
                        }} />
                        {chat.transcript.map((msg, i) => makeMessage({ index:i, isFirst: i == 0, isLast: (i == chat.transcript.length - 1), message: msg }))}
                    </MessageList>
                    <MessageInput placeholder="Type answer here" attachDisabled attachButton={false} autoFocus sendButton onSend={onSend}  />
                </ChatContainer>
            </MainContainer>
        </div>
    )
}


