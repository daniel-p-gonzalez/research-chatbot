import { Button, Group, Image, Title } from "@mantine/core";
import Staxly from '../assets/staxly.svg'
import { Eraser, X } from "tabler-icons-react";
import { FC } from "react";

export const ChatHeader: FC<{clearChat: () => void}> = ({ clearChat }) => {
    return (
        <Group px='xs' bg='#D4450C' position='apart'>
            <Group>
                <Image src={Staxly} height={50} width={50} mt={10} alt='Staxly Logo' />
                <Title color='#ffffff' order={5}>Ask Staxly</Title>
            </Group>

            <Group spacing='xs'>
                <Button c='#FFF'
                        variant='transparent'
                        leftIcon={<Eraser />}
                        onClick={() => clearChat()}
                >
                    Clear chat
                </Button>
                <X color='#FFF' />
            </Group>
        </Group>
    )
}
