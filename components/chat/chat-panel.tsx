import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import styled from '@emotion/styled'
import {
    ChatContainer,
    MainContainer,
    Message as ChatMessage,
    MessageInput,
    MessageList,
} from '@chatscope/chat-ui-kit-react';
import { CHATIDPARAM, ChatMessageReply, DEFAULT_MODEL, TranscriptMessage } from '#lib/types'
import { pushNewSearchParam, searchParam } from '#lib/util'
import { initialMessage } from '#lib/chat'
import { sendMsgAndListen } from '#lib/send-and-listen'
import { useEffect, useState } from 'react'
import { Request } from '#lib/request'
import { Box } from 'boxible'
import { Button, CloseButton, Flex, Group, Select, Text } from '@mantine/core';
import { useLocalstorageState } from '@nathanstitt/sundry/base';
import { ChatHeader } from "#components/chat/chat-header";
import { OXColoredStripe } from "#components/ox-colored-stripe";
import { ThumbDown, ThumbUp } from "tabler-icons-react";


function makeMessage({ isFirst, isLast, message }: { index: number, isFirst: boolean, isLast: boolean, message: TranscriptMessage }) {
    return (
        <ChatMessage key={message.id} model={{
            position: isFirst ? 'single' : isLast ? 'last' : 'normal',
            direction: message.isBot ? 'incoming' : 'outgoing',
            message: message.content || '…',
            sentTime: "just now",
        }}>
            <ChatMessage.Header >
                <Flex justify={message.isBot ? 'start' : 'end'} w='100%'>
                    {message.isBot ? 'Staxly' : 'Me'}
                </Flex>
            </ChatMessage.Header>
            {message.isBot &&
                <ChatMessage.Footer>
                    <Group position='apart' w='100%'>
                        <Button c='#848484' size='xs' variant='unstyled' style={{ textUnderlineOffset: '.25rem' }} td='underline'>
                            Leave Feedback
                        </Button>
                        <Group>
                            <ThumbUp color='#DBDBDB' />
                            <ThumbDown color='#DBDBDB' />
                        </Group>
                    </Group>
                </ChatMessage.Footer>
            }
        </ChatMessage>
    )
}


const Wrapper = styled(Box)({
    border: '1px solid',
    background: 'white',
    filter: 'drop-shadow(1px 1px 4px #000)',
})

const Header = styled(Box)({

})

export type ChatPanelProps = {
    subject: string
    topic: string
    onClose: () => void
    isOpen: boolean
    height?: string
    width?: string
    className?: string
    onMessage?: (messageId: string) => void
}


export const ChatPanel: React.FC<ChatPanelProps> = ({
    onClose, isOpen, topic, subject, className,
    height = '100%', width = '100%'
}) => {
    const [model, setModel] = useLocalstorageState('model', DEFAULT_MODEL)
    const [chat, setChat] = useState<ChatMessageReply>({ id: searchParam(CHATIDPARAM) || '', transcript: [] })
    const [transmitting, setTransmitting] = useState(false)

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

    useEffect(() => {
        if (!isOpen) setChat({ id: '', transcript: [] })
    }, [isOpen])

    if (!isOpen) return null

    const clearChat = () => {
        setChat({ id: searchParam(CHATIDPARAM) || '', transcript: [] })
    }

    const onSend = async (_:string, message: string) => {
        const cc = { ...chat, transcript: [...chat.transcript] }; // create a local copy and use that, otherwise methods below will act on stale state
        cc.transcript.push({ id: 'temp', content: message, isBot: false, occurred: '' }, { id: 'temp-reply', content: '', isBot: true, occurred: '' })
        setChat(cc)
        setTransmitting(true)
        await sendMsgAndListen({ chatId: cc.id, message, model, topic, subject }, {
            initial: (newChat) => {
                if (!cc.id) {
                    pushNewSearchParam(CHATIDPARAM, newChat.id)
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
            close: (finished) => {
                finished && setTransmitting(false)
            }
        })
    }


    return (
        <Wrapper width={width} height={height} direction="column" className={className}>
            <Header
                justify="between" align="center" padding="default" className="header"
            >
                <Select
                    mt="xs"
                    size="xs"
                    style={{ maxWidth: 160 }}
                    value={model}
                    onChange={(m) => m && setModel(m)}
                    data={[ { label: 'llama2-70B', value: 'togethercomputer/llama-2-70b-chat' },
                            { label: 'llama2-13B', value: 'togethercomputer/llama-2-13b-chat' },
                            { label: 'SelfHosted (33B)', value: 'self-hosted' }]}
                    placeholder="LLM Model"
                    label={false}

                />
                <CloseButton onClick={() => onClose()} size="xl" title="Close chat window" />
            </Header>

            <ChatHeader clearChat={clearChat} />
            <OXColoredStripe />

            <MainContainer style={{ height: '100%', border: 'none' }}>
                <ChatContainer>
                    <MessageList>
                        <ChatMessage model={{
                            position: 'single',
                            direction: 'incoming',
                            message: initialMessage({ topic, subject }),
                            sentTime: "just now",
                            sender: 'Staxly',
                        }} />
                        {chat.transcript.map((msg, i) => makeMessage({ index: i, isFirst: i == 0, isLast: (i == chat.transcript.length - 1), message: msg }))}
                    </MessageList>

                    <MessageInput
                        placeholder="Type message (do not share personal data)"
                        attachButton={false}
                        autoFocus
                        sendButton
                        sendDisabled={transmitting}
                        sendOnReturnDisabled={transmitting}
                        onSend={onSend}
                    />
                </ChatContainer>
            </MainContainer>

            <Group bg='#DBF3F8' p='1em' position='apart'>
                <Text size='xs'>Terms | Privacy | FAQ </Text>
                <Text size='xs'>Powered by together.ai </Text>
            </Group>
        </Wrapper>
    )
}

const ChatFooter = () => {

}
