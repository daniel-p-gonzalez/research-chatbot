import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message as ChatMessage, MessageInput } from '@chatscope/chat-ui-kit-react';
import { navigate } from 'vite-plugin-ssr/client/router'
import { ChatMessageReply, WelcomeMessage, MessageJSON } from '../../lib/types'
import { useSSEUpdates, MsgUpdateCB } from '../../lib/sse-hook'
import { useState, useCallback, useEffect } from 'react'
import { Request } from '../../lib/request'
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
    const ctx = usePageContext()

    const [chatId, setId] = useState(ctx.routeParams.id || '')
    const [log, setLog] = useState<MessageJSON[]>([])

    const onMsg: MsgUpdateCB = useCallback(async (update) => {
        const updatedLog = log.map(msg => msg.id == update.msgId ? { ...msg, content: update.content } : msg)
        console.log(updatedLog)
        setLog(updatedLog)
    }, [log])

    useSSEUpdates(chatId, onMsg)

    useEffect(() => {
        if (chatId) {
            Request<ChatMessageReply>(`/api/chat/${chatId}`).then((reply) => {
                setLog(reply.transcript)
            })
        }
    }, [])

    const onSend = async (message: string) => {
        const reply = await Request<ChatMessageReply>('/api/chat/message', { method: 'POST', json: { chatId, message } })
        if (!chatId) {
            navigate(`/chat/${reply.id}`, { overwriteLastHistoryEntry: true })
        }
        setId(reply.id)
        setLog(reply.transcript)
    }
    console.log({ log })
    return (
        <div style={{ position: "relative", height: "500px" }}>
            <MainContainer>
                <ChatContainer>
                    <MessageList>
                        <ChatMessage model={{
                            position: log.length ? 'normal' : 'single',
                            direction: 'incoming',
                            message: WelcomeMessage,
                            sentTime: "just now",
                            sender: 'TutorBot',
                        }} />
                        {log.map((msg, i) => makeMessage({ index:i, isFirst: i == 0, isLast: (i == log.length - 1), message: msg }))}
                    </MessageList>
                    <MessageInput placeholder="Type answer here" autoFocus sendButton={true} onSend={onSend}  />
                </ChatContainer>
            </MainContainer>
        </div>
    )
}
