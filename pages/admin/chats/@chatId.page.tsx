import { usePageContext } from '#lib/page-context'

import { Request } from '#lib/request'
import { LoadingOverlay } from '@mantine/core'
export { Layout } from './layout'
import { useQuery } from '@tanstack/react-query'
import { ChatMessageReply } from '#lib/types'
import { Box } from 'boxible'
import { Message } from '@chatscope/chat-ui-kit-react'
import dayjs from 'dayjs'

export const Page = () => {
    const pageContext = usePageContext()
    const { chatId } = pageContext.routeParams

    const query = useQuery<ChatMessageReply>({ queryKey: ['chat', chatId ], queryFn: async () => {
        return await Request<ChatMessageReply>('/api/chat/fetch-messages', {
            method: 'POST', json: { chatId }
        })
    } })

    const msgs = query.data?.transcript || []

    return (
        <Box margin="lg" direction="column">
            <h3>{msgs[0]?.occured ? dayjs(msgs[0]?.occured).format('MMM D, YYYY h:mma') : ''}</h3>
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
