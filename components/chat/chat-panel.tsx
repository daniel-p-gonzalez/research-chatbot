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
import { FC, useEffect, useState } from 'react'
import { Request } from '#lib/request'
import { Box } from 'boxible'
import {
    Anchor,
    Button,
    Center,
    CloseButton,
    Drawer,
    Flex,
    Group,
    Image,
    Select,
    Stack,
    Text,
    Textarea,
    Title,
    Tooltip
} from '@mantine/core';
import { useLocalstorageState } from '@nathanstitt/sundry/base';
import { ChatHeader } from "#components/chat/chat-header";
import { OXColoredStripe } from "#components/ox-colored-stripe";
import { ExternalLink, ThumbDown, ThumbUp } from "tabler-icons-react";
import dayjs from "dayjs";
import { useTimer } from 'react-timer-hook';
import { Notifications, showNotification } from "@mantine/notifications";
import Staxly from "#components/assets/staxly.svg";

function makeMessage({ isFirst, isLast, message, transmitting }: { index: number, isFirst: boolean, isLast: boolean, message: TranscriptMessage, transmitting: boolean }) {
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

            {message.isBot && !transmitting &&
                <ChatMessage.Footer>
                    <Group justify='space-between' w='100%'>
                        <LeaveFeedback message={message}/>
                        <Group>
                            <ThumbDown cursor='pointer'
                                onClick={() => {
                                    showNotification({ message: <Text size='sm'>Thank you for your feedback! We&apos;ll be sure to review it as soon as possible. Staxly can make mistakes sometimes. <Anchor target="_blank" href="">Here&apos;s why.</Anchor></Text> })
                                    // TODO Re-prompt chatbot
                                }}
                                color={message.disliked ? '#CA2026' : '#DBDBDB'}
                            />
                            <ThumbUp cursor='pointer'
                                onClick={() => showNotification({
                                    message: "ASDF Thank you for helping us improve Staxly!"
                                })}
                                color={message.liked ? '#63A524' : '#DBDBDB'}
                            />
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

const LeaveFeedback: FC<{ message: TranscriptMessage }> = ({ message }) => {
    console.log(message.chatId);
    const [open, setOpen] = useState(false);
    const submitFeedback = () => {
        Request<ChatMessageReply>(
            '/api/chat/feedback', {
                method: 'POST',
                json: { chatId: message.chatId }
            }
        ).then((reply) => {
            console.log(reply)
            // if (reply.error) {
            //     console.warn(reply.error)
            // } else {
            //     setChat(reply)
            // }
        })
        setOpen(false)
    }
    return (
        <>
            <Drawer.Root size='sm' portalProps={{ target: '.react-draggable' }} position='bottom' opened={open} onClose={() => setOpen(false)}>
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

                    <Drawer.Body>
                        <Stack justify='space-between'>
                            <Stack align='center'>
                                <Image src={Staxly} h={50} w={50} alt='Staxly Logo' />
                                <Title order={5}>Share your feedback with us</Title>
                            </Stack>

                            <Stack>
                                <Textarea rows={5} name='feedback'/>
                                <Button color='orange' onClick={() => submitFeedback()}>
                                    Submit & Continue chat
                                </Button>
                            </Stack>
                        </Stack>
                    </Drawer.Body>
                </Drawer.Content>
            </Drawer.Root>
            <Button onClick={() => setOpen(true)} c='#848484' size='xs' variant='transparent' style={{ textUnderlineOffset: '.25rem' }} td='underline'>
                Leave Feedback
            </Button>
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
        setChat({ id: '', transcript: [] })
    }

    const onSend = async (_:string, message: string) => {
        const cc = { ...chat, transcript: [...chat.transcript] }; // create a local copy and use that, otherwise methods below will act on stale state
        cc.transcript.push({
            id: 'temp',
            chatId: "",
            content: message,
            isBot: false,
            occurred: '',
        }, {
            id: 'temp-reply',
            chatId: "",
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

            <Notifications position='top-center' portalProps={{ target: '.react-draggable' }} />
            <ChatHeader clearChat={clearChat} onClose={onClose}/>
            <OXColoredStripe />
            <AutoFeedback />
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
                        {chat.transcript.map((msg, i) => makeMessage({ index: i, isFirst: i == 0, isLast: (i == chat.transcript.length - 1), message: msg, transmitting }))}
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
                <Text size='xs' display='flex' c='#848484'>
                    Powered by&nbsp;
                    <Anchor href='https://together.ai/about' target='_blank' display='flex' underline='always' c='#848484' size='xs'>
                        together.ai&nbsp;<ExternalLink  height={14} width={14} />
                    </Anchor>
                </Text>
            </Group>
        </Wrapper>
    )
}

const AutoFeedback = () => {
    const [open, setOpen] = useState(false)
    const {
        totalSeconds,
        seconds,
        minutes,
        hours,
        days,
        isRunning,
        start,
        pause,
    } = useTimer({
        expiryTimestamp: dayjs().add(15, 'minutes').toDate(),
        autoStart: true ,
        onExpire: () => setOpen(true)
    });
    // TODO Fetch persisted time and use it when we eventually store it
    return (
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
                    {/* TODO Update qualtrics URL when the feedback survey is ready */}
                    <QualtricsFeedback src='https://riceuniversity.co1.qualtrics.com/jfe/form/SV_bKM7QsMAw9HfeVU' />
                </Drawer.Body>
            </Drawer.Content>
        </Drawer.Root>
    )
    // return null
    // return (
    //     <Drawer.Root size='lg' portalProps={{ target: '.react-draggable' }} position='bottom' opened={open} onClose={() => setOpen(false)}>
    //         <Drawer.Overlay />
    //         <Drawer.Content style={{ overflow: 'hidden' }}>
    //             <Drawer.Header bg='#FFF' style={{ padding: 0, justifyContent: 'flex-end' }}>
    //                 <Drawer.Title>
    //                     <Button c='#848484'
    //                             size='xs'
    //                             variant='transparent'
    //                             style={{ textUnderlineOffset: '.25rem' }}
    //                             td='underline'
    //                             onClick={() => setOpen(false)}
    //                     >
    //                         Return to chat
    //                     </Button>
    //                 </Drawer.Title>
    //             </Drawer.Header>
    //             <Drawer.Body p={0} h='100%' style={{ overflow: 'hidden' }}>
    //                 {/* TODO Update qualtrics URL when the feedback survey is ready */}
    //                 <QualtricsFeedback src='https://riceuniversity.co1.qualtrics.com/jfe/form/SV_bKM7QsMAw9HfeVU' />
    //             </Drawer.Body>
    //         </Drawer.Content>
    //     </Drawer.Root>
    // )
}
