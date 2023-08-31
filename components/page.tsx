import styled from '@emotion/styled'

export { Chat } from './chat'

export const PageWrapper = styled.div({
    padding: 10,
    gridArea: 'main',
    overflow: 'auto',
})

export const PageContent:React.FC = ({ children }) => {
    return <PageWrapper className="page">{children}</PageWrapper>
}
