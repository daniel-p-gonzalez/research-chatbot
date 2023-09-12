import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { createPortal } from 'react-dom'
import styled from '@emotion/styled'
import {
    MainContainer, ChatContainer, MessageList, Message as ChatMessage, MessageInput,
} from '@chatscope/chat-ui-kit-react';
import { Rnd } from 'react-rnd'
import { ChatMessageReply, TranscriptMessage, DEFAULT_MODEL, CHATIDPARAM } from '#lib/types'
import { pushNewSearchParam, searchParam } from '#lib/util'
import { initialMessage } from '#lib/chat'
import { sendMsgAndListen } from '#lib/send-and-listen'
import { useState, useEffect } from 'react'
import { Request } from '#lib/request'
import { Box } from 'boxible'
import { CloseButton, Select } from '@mantine/core';
import { useLocalstorageState } from '@nathanstitt/sundry/base';


function makeMessage({ isFirst, isLast, message }: { index: number, isFirst: boolean, isLast: boolean, message: TranscriptMessage }) {

    return (
        <ChatMessage key={message.id} model={{
            position: isFirst ? 'single' : isLast ? 'last' : 'normal',
            direction: message.isBot ? 'incoming' : 'outgoing',
            message: message.content || '…',
            sentTime: "just now",
            sender: message.isBot ? 'Staxly' : 'You',
        }} />

    )
}


const Wrapper = styled(Box)({
    border: '1px solid',
    background: 'white',
    filter: 'drop-shadow(1px 1px 4px #000)',
})

const Header = styled(Box)({
    cursor: 'move',
    '.react-draggable-dragging &': {
        cursor: 'grabbing',
    }
})

type ChatWindowProps = {
    subject: string
    topic: string
    onClose: () => void
    isOpen: boolean
}


export const ChatWindow: React.FC<ChatWindowProps> = ({ onClose, isOpen, topic, subject }) => {


    const [model, setModel] = useLocalstorageState('model', DEFAULT_MODEL)
    const [chat, setChat] = useState<ChatMessageReply>({id: searchParam(CHATIDPARAM) || '', transcript: []})

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

    const onSend = (_:string, message: string) => {
        const cc = { ...chat, transcript: [...chat.transcript] }; // create a local copy and use that, otherwise methods below will act on stale state
        cc.transcript.push({ id: 'temp', content: message, isBot: false, occured: '' }, { id: 'temp-reply', content: '', isBot: true, occured: '' })
        setChat(cc)
        sendMsgAndListen({ chatId: cc.id, message, model, topic, subject }, {
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
        })
    }

    return createPortal((
        <Rnd default={{
            x: window.innerWidth-470,
            y: 20,
            width: 450,
            height: window.innerHeight-40,
        }}
        minWidth="350px"
        minHeight="450px"

        dragHandleClassName='header'
    >

        <Wrapper width={"100%"} height={"100%"} direction="column">

            <Header justify="between" align="center" padding="default" className="header">
                <Select
                    mt="xs"
                    size="xs"
                    style={{ maxWidth: 160 }}
                    value={model}
                    onChange={(m) => m && setModel(m)}
                    data={[ { label: 'llama2-70B', value: 'togethercomputer/llama-2-70b-chat' },
                            { label: 'llama2-13B', value: 'togethercomputer/llama-2-13b-chat'},
                            { label: 'SelfHosted (33B)', value: 'self-hosted' }]}
                    placeholder="LLM Model"
                    label={false}

                />
                <CloseButton onClick={onClose} size="xl" title="Close chat window" />
            </Header>


            <MainContainer style={{ height: '100%' }}>
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
                        placeholder="Type answer here"
                        attachButton={false}
                        autoFocus
                        sendButton
                        onSend={onSend}
                    />
                </ChatContainer>
            </MainContainer>
        </Wrapper>
    </Rnd>
    ), document.body)

}
