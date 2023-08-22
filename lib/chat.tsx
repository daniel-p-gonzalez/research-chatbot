import styled from '@emotion/styled'
import { ChatWindow } from '#lib/chat-window';
import { useToggle } from '@nathanstitt/sundry/base'

import { LaunchIcon } from '#lib/launch-icon';

const Wrapper = styled.div({
    float: 'left',
    overflow: 'visible',
    width: 200,
    height: 150,
    margin: 10,
    marginLeft: 0,
    position: 'relative',
})

export const Chat: React.FC = () => {
    const { setEnabled, setDisabled, isEnabled } = useToggle(false)

    return (
        <Wrapper>
            <LaunchIcon onClick={setEnabled} isOpen={isEnabled} />
            <ChatWindow onClose={setDisabled} isOpen={isEnabled} />
        </Wrapper>
    )
}
