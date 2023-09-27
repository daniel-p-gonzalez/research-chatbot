import styled from '@emotion/styled'
import type { PropsWithChildren } from 'react'
export { Chat } from './chat/chat'

export const PageWrapper = styled.main({
    padding: 10,
    minHeight: '100vh',
    gridArea: 'main',
    overflow: 'auto',
})

export const PageContent = ({ children }: PropsWithChildren) => {
    return <PageWrapper className="page">{children}</PageWrapper>
}
