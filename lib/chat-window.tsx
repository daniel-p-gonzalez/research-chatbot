import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import styled from '@emotion/styled'
import {
    MainContainer, ChatContainer, MessageList, Message as ChatMessage, MessageInput,

} from '@chatscope/chat-ui-kit-react';
import { navigate } from 'vite-plugin-ssr/client/router'
import { IconPlus } from '@tabler/icons-react';
import { isBrowser } from '#lib/util'
import { ChatMessageReply, WelcomeMessage, MessageJSON, DEFAULT_MODEL } from '#lib/types'
import { sendMsgAndListen } from '#lib/send-and-listen'
import { useState, useEffect } from 'react'
import { Request } from '#lib/request'
import { Box } from 'boxible'
import { CloseButton, Button } from '@mantine/core';


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


const Wrapper = styled(Box)({
    border: '1px solid',
    background: 'white',
    position: 'absolute',
    right: 10,
    bottom: -50,
})

type ChatWindowProps = {
    subject: string
    topic: string
    onClose: () => void
    isOpen: boolean
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onClose, isOpen, topic, subject }) => {

    const defaultChatId = isBrowser() ? window.location?.hash?.slice(1) || '' : ''
    const [model, setModel] = useState<string>(DEFAULT_MODEL)

    const [chat, setChat] = useState<ChatMessageReply>({id: defaultChatId, transcript: []})

    useEffect(() => {
        if (chat.id) {
            Request<ChatMessageReply>(
                '/api/chat/fetch-messages', {
                    method: 'POST',
                    json: { chatId: chat.id }
                }
            ).then((reply) => {
                if (reply.error) {
                    console.warn(reply.error)
                } else {
                    setChat(reply)
                }
            })
        }
    }, [])

    if (!isOpen) return null

    const onSend = (_:string, message: string) => {
        const cc = { ...chat, transcript: [...chat.transcript] }; // create a local copy and use that, otherwise methods below will act on stale state
        cc.transcript.push({ id: 'temp', content: message, isBot: false }, { id: 'temp-reply', content: '', isBot: true })
        setChat(cc)
        sendMsgAndListen({ chatId: cc.id, message, model, topic, subject }, {
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
        <Wrapper width="350px" height="500px" direction="column" >

            <Box justify="between" align="center" padding="horizontal">
                <Button
                    onClick={() => navigate('/chat')}
                    rightIcon={<IconPlus />} size="sm"
                >
                    New Chat
                </Button>
                <CloseButton onClick={onClose} size="xl" title="Close chat window" />
            </Box>


            <MainContainer style={{ height: '100%' }}>
                <ChatContainer>
                    <MessageList>
                        <ChatMessage model={{
                            position: 'single',
                            direction: 'incoming',
                            message: `Hello, I’m TutorBot.  Would you like to know more about ${topic}? I can also answer any other questions about ${subject}`,
                            sentTime: "just now",
                            sender: 'TutorBot',
                        }} />
                        {chat.transcript.map((msg, i) => makeMessage({ index: i, isFirst: i == 0, isLast: (i == chat.transcript.length - 1), message: msg }))}
                    </MessageList>

                    <MessageInput
                        placeholder="Type answer here"
                        attachButton={false}
                        autoFocus
                        sendButton
                        onSend={onSend}
                    />
                </ChatContainer>
            </MainContainer>
        </Wrapper>
    )
}


