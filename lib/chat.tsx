import styled from '@emotion/styled'
import { ChatWindow } from '#lib/chat-window';
import { useToggle } from '@nathanstitt/sundry/base'

import { LaunchIcon } from '#lib/launch-icon';

const Wrapper = styled.div({
    float: 'right',
    overflow: 'visible',
    width: 200,
    height: 150,
    margin: 10,
    marginLeft: 0,
    position: 'relative',
})

type ChatProps = {
    topic: string
    subject: string
}

export const Chat: React.FC<ChatProps> = (chatProps) => {
    const { setEnabled, setDisabled, isEnabled } = useToggle(false)

    return (
        <Wrapper>
            <LaunchIcon onClick={setEnabled} isOpen={isEnabled} />
            <ChatWindow onClose={setDisabled} isOpen={isEnabled} {...chatProps} />
        </Wrapper>
    )
}
