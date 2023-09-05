import styled from '@emotion/styled'
import type { PropsWithChildren } from 'react'

export { Chat } from './chat'

export const PageWrapper = styled.div({
    padding: 10,
    gridArea: 'main',
    overflow: 'auto',
})

export const PageContent:React.FC<PropsWithChildren> = ({ children }) => {
    return <PageWrapper className="page">{children}</PageWrapper>
}
