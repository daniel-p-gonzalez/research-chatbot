import styled from '@emotion/styled'
import { searchParam, pushNewSearchParam } from '#lib/util'
import { ChatWindow } from './chat-window';
import { useToggle } from '@nathanstitt/sundry/base'
import { CHATIDPARAM } from '#lib/types'
import { LaunchIcon } from './launch-icon';

const Wrapper = styled.div({
    float: 'right',
    overflow: 'visible',
    width: 200,
    height: 150,
    margin: 10,
    marginLeft: 0,
})

type ChatProps = {
    topic: string
    subject: string
}

export const Chat: React.FC<ChatProps> = (chatProps) => {
    const chatId = searchParam(CHATIDPARAM)
    const { setEnabled, setDisabled, isEnabled } = useToggle(!!chatId)

    const onClose = () => {
        setDisabled()
        pushNewSearchParam(CHATIDPARAM, null)
    }

    return (
        <Wrapper>
            <LaunchIcon onClick={setEnabled} isOpen={isEnabled} />
            <ChatWindow onClose={onClose} isOpen={isEnabled} {...chatProps} />
        </Wrapper>
    )
}
