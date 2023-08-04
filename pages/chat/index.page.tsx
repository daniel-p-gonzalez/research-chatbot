import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
    MainContainer, ChatContainer, MessageList, Message as ChatMessage, MessageInput,
} from '@chatscope/chat-ui-kit-react';
import { navigate } from 'vite-plugin-ssr/client/router'
import { isBrowser } from '#lib/util'
import { ChatMessageReply, WelcomeMessage, MessageJSON, DEFAULT_MODEL } from '#lib/types'
import { sendMsgAndListen } from '#lib/sse-hook'
import { useState, useEffect } from 'react'
import { Request } from '#lib/request'
import { Box } from 'boxible'
import { Select, Button } from '@mantine/core';
import { PlaylistAdd } from 'tabler-icons-react'

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

    const onSend = (_:string, message: string) => {
        const cc = chat; // create a local copy and use that, otherwise methods below will act on stale state
        sendMsgAndListen({ chatId: cc.id, message, model }, {
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
        <Box style={{ position: "relative", minWidth: '80vw', minHeight: '90vh' }} direction="column" align="center">

            <Box width={ '500px' } direction="column" >

                <Box justify="between" align="end" margin={{ bottom: '8px' }}>
                    <Button
                        onClick={() => navigate('/chat')}
                        rightIcon={<PlaylistAdd />} size="md"
                    >
                        Start New Chat
                    </Button>
                    <Select
                        mt="md"
                        value={model}
                        onChange={(m) => m && setModel(m)}
                        data={['llama-2-7b', 'llama-2-13b', 'llama-2-70b']}
                        placeholder="Pick one"
                        label="Model to use"

                    />
                </Box>


                <MainContainer>
                    <ChatContainer>
                        <MessageList style={{ minHeight: '80vh' }}>
                            <ChatMessage model={{
                                position: chat.transcript.length ? 'normal' : 'single',
                                direction: 'incoming',
                                message: WelcomeMessage,
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
            </Box>
        </Box>
    )
}


