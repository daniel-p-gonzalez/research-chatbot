export { Layout } from './layout'
import { Request } from '#lib/request'
import { LoadingOverlay } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { ChatMessageReply } from '#lib/types'
import { searchParam } from '#lib/util'
import { Box } from 'boxible'
import { Message } from '@chatscope/chat-ui-kit-react'
import dayjs from 'dayjs'
import { Loading } from '#components/misc'
import { ClientOnly } from '#components/client-only'

const ChatReview: React.FC<{chatId: string}> = ({ chatId }) => {

    const query = useQuery<ChatMessageReply>({ queryKey: ['chat', chatId ], queryFn: async () => {
        return await Request<ChatMessageReply>('/api/chat/fetch-messages', {
            method: 'POST', json: { chatId }
        })
    } })

    if (query.isLoading) return <Loading />
    const chat = query.data || { model: null }
    const msgs = query.data?.transcript || []
    const firstMsg = msgs[0] || { }

    return (
        <Box margin="lg" direction="column">
            <h3>{dayjs(firstMsg.occurred).format('MMM D, YYYY h:mma')} Model: { chat.model || 'unknown'}</h3>
            <LoadingOverlay visible={query.isLoading} overlayBlur={2} />
            {msgs.map(message => (
                <Message
                    key={message.id}
                    model={{
                        position: 'single',
                        direction: message.isBot ? 'incoming' : 'outgoing',
                        message: message.content || '…',
                        sender: message.isBot ? 'Staxly' : 'You',
                    }}
                />
            ))}
        </Box>
    )


}

export const Page = () => {
    const chatId = searchParam('chatId')
    return (
        <ClientOnly>
            {chatId ? <ChatReview chatId={chatId} /> : <h1>Select chat from left</h1>}
        </ClientOnly>
    )
}
