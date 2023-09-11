import { Box } from 'boxible'
import styled from '@emotion/styled'
import dayjs from 'dayjs'
import { Link } from '#components/link'
import { QueryError } from '#components/query-error'
import { Text, NavLink } from '@mantine/core';
import { DatePickerInput, DateValue } from '@mantine/dates';
import { useState } from 'react'
import type { ChatWithFirstMessage } from '#lib/types'
import { useQuery } from '@tanstack/react-query'
import { Request } from '#lib/request';


 const Wrapper = styled(Box)({
    borderRight: '1px solid #ccc',
    flexDirection: 'column',
    gridArea: 'sidebar',
    overflow: 'auto',
    flexWrap: 'nowrap',
    width: 300,
    height: '100%',
    padding: '40px 10px',

    '@media print': {
        display: 'none',
    },
    a: {
    },
    ul: {
        listStyle: 'none',
    },
    li: {
        marginBottom: '8px',
    }
})



const ChatLink = styled(Link)({
    color: 'rgb(66, 66, 66)',
    fontSize: '16px',
    lineHeight: '18px',
    textDecoration: 'none',
    display: 'flex',
    gap: '5px',
    flexDirection: 'column',
    // limit text to 100 chars and show ellipsis when it overflows
    overflow: 'hidden',
    maxHeight: 56,
    '&:hover': {

        // '> *': {
        //     textDecoration: 'underline',
        // }
    },
    '&.is-active': {
        fontWeight: 'bold',
    }

})


type ChatsReply = { chats: ChatWithFirstMessage[] }

const Chat: React.FC<{ chat: ChatWithFirstMessage }> = ({ chat }) => {
    return (
        <NavLink label={(
            <ChatLink href={`/admin/chats/${chat.id}`}>
                <span>{chat.message}</span>
                <Text fz="sm">{dayjs(chat.occured).format('MMM D, YYYY h:mma')}</Text>
            </ChatLink>
        )} />
    )
}


type DateRange = [DateValue, DateValue]

// const useChatsBetweenDates = () => {

// }

export const Sidebar: React.FC = () => {
    const [range, setRange] = useState<DateRange>([dayjs().startOf('day').toDate(), dayjs().endOf('day').toDate()]);

    const query = useQuery<ChatsReply, Error>(['chats', ...range ], async () => {
        const params = new URLSearchParams({ start: range[0]?.toISOString() || '', end: range[1]?.toISOString() || ''})
        return await Request<ChatsReply>(`/api/admin/chats?${params.toString()}`)
    })


    const chats = query.data?.chats || []

    return (
        <Wrapper>
            <DatePickerInput
                label="Conversations on Dates"
                type="range"
                placeholder="date range"
                value={range}
                valueFormat="MMM D YYYY"
                onChange={setRange}
                variant="unstyled"
            />
            <QueryError error={query.error} />

            {chats.map(c => <Chat key={c.id} chat={c} />)}

        </Wrapper>
    )

}
