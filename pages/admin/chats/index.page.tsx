export { Layout } from './layout'
import { Request } from '#lib/request'
import { LoadingOverlay } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { ChatMessageReply } from '#lib/types'
import { searchParam } from '#lib/util'
import { Box } from 'boxible'
import { Message } from '@chatscope/chat-ui-kit-react'
import dayjs from 'dayjs'


const ChatReview: React.FC<{chatId: string}> = ({ chatId }) => {

    const query = useQuery<ChatMessageReply>({ queryKey: ['chat', chatId ], queryFn: async () => {
        return await Request<ChatMessageReply>('/api/chat/fetch-messages', {
            method: 'POST', json: { chatId }
        })
    } })

    const msgs = query.data?.transcript || []
    const firstMsg = msgs[0] || { }
    return (
        <Box margin="lg" direction="column">
            <h3>{dayjs(firstMsg.occured).format('MMM D, YYYY h:mma')} Model: { firstMsg.model || 'unknown'}</h3>
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
    if (chatId) {
        return <ChatReview chatId={chatId} />
    }
    return (
        <>
            <h1>Select chat from left</h1>
        </>
    )

}
