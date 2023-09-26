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
import { Anchor, Button, Center, CloseButton, Drawer, Flex, Group, Select, Text, Tooltip } from '@mantine/core';
import { useLocalstorageState } from '@nathanstitt/sundry/base';
import { ChatHeader } from "#components/chat/chat-header";
import { OXColoredStripe } from "#components/ox-colored-stripe";
import { ExternalLink, ThumbDown, ThumbUp } from "tabler-icons-react";
import dayjs from "dayjs";

function makeMessage({ isFirst, isLast, message }: { index: number, isFirst: boolean, isLast: boolean, message: TranscriptMessage }) {
    return (
        <ChatMessage key={message.id} model={{
            position: isFirst ? 'single' : isLast ? 'last' : 'normal',
            direction: message.isBot ? 'incoming' : 'outgoing',
            message: message.content || '…',
        }}>
            <ChatMessage.Header>
                <Flex justify={message.isBot ? 'start' : 'end'} w='100%'>
                    <Tooltip label={message.occurred}>
                        <span>{message.isBot ? 'Staxly' : 'Me'}</span>
                    </Tooltip>
                </Flex>
            </ChatMessage.Header>
            {message.isBot &&
                <ChatMessage.Footer>
                    <Group justify='space-between' w='100%'>
                        <Button c='#848484' size='xs' variant='transparent' style={{ textUnderlineOffset: '.25rem' }} td='underline'>
                            Leave Feedback
                        </Button>
                        <Group>
                            <ThumbsUpFeedback />
                            <ThumbDown color='#DBDBDB' />
                        </Group>
                    </Group>
                </ChatMessage.Footer>
            }
        </ChatMessage>
    )
}

const QualtricsFeedback = styled.iframe({
    height: '100%',
    width: '100%',
})

const ThumbsUpFeedback = () => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Drawer.Root size='lg' portalProps={{ target: '.react-draggable' }} position='bottom' opened={open} onClose={() => setOpen(false)}>
                <Drawer.Overlay />
                <Drawer.Content style={{ overflow: 'hidden' }}>
                    <Drawer.Header bg='#FFF' style={{ padding: 0, justifyContent: 'flex-end' }}>
                        <Drawer.Title>
                            <Button c='#848484'
                                    size='xs'
                                    variant='transparent'
                                    style={{ textUnderlineOffset: '.25rem' }}
                                    td='underline'
                                    onClick={() => setOpen(false)}
                            >
                                Return to chat
                            </Button>
                        </Drawer.Title>
                    </Drawer.Header>
                    <Drawer.Body p={0} h='100%' style={{ overflow: 'hidden' }}>
                        <QualtricsFeedback src='https://riceuniversity.co1.qualtrics.com/jfe/form/SV_bKM7QsMAw9HfeVU' />
                    </Drawer.Body>
                </Drawer.Content>
            </Drawer.Root>
            <ThumbUp onClick={() => {setOpen(true)}} color='#DBDBDB' />
        </>
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


export const ChatPanel = ({
    onClose, isOpen, topic, subject, className,
    height = '100%', width = '100%'
}: ChatPanelProps) => {
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
    }, [chat.id])

    useEffect(() => {
        if (!isOpen) setChat({ id: '', transcript: [] })
    }, [isOpen])

    if (!isOpen) return null

    const clearChat = () => {
        setChat({ id: searchParam(CHATIDPARAM) || '', transcript: [] })
    }

    const onSend = async (_:string, message: string) => {
        const cc = { ...chat, transcript: [...chat.transcript] }; // create a local copy and use that, otherwise methods below will act on stale state
        cc.transcript.push({
            id: 'temp',
            content: message,
            isBot: false,
            occurred: '',
        }, {
            id: 'temp-reply',
            content: '',
            isBot: true,
            occurred: '',
        })
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

            <ChatHeader clearChat={clearChat} onClose={onClose}/>
            <OXColoredStripe />
            <Center mt={'1rem'}>
                <Text size='xs'>
                    {chat.transcript[0]?.occurred ? 
                        dayjs(chat.transcript[0].occurred).format('ll LT') : 
                        null
                    }
                </Text>
            </Center>

            <MainContainer style={{ height: '100%', border: 'none' }}>
                <ChatContainer>
                    <MessageList>
                        <ChatMessage model={{
                            position: 'single',
                            direction: 'incoming',
                            message: initialMessage({ topic, subject }),
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

            <Group bg='#DBF3F8' p='.5em 1em' justify='space-between'>
                <Text size='xs' c='#026AA1'>
                    <Anchor href='' target='_blank'>
                        Terms
                    </Anchor>
                    <span> | </span>
                    <Anchor href='' target='_blank'>
                        Privacy
                    </Anchor>
                    <span> | </span>
                    <Anchor href='' target='_blank'>
                        FAQ
                    </Anchor>
                </Text>
                <Anchor display='flex' underline='always' c='#848484' size='xs'>
                    Powered by together.ai&nbsp;<ExternalLink height={14} width={14} />
                </Anchor>
            </Group>
        </Wrapper>
    )
}
