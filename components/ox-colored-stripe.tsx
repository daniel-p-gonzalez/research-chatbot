import { Group, Box } from "@mantine/core";

export const OXColoredStripe = () => (
    <Group h={5} gap={0}>
        <Box h={5} bg='#f47541' style={{ flex: 3.5 }}></Box>
        <Box h={5} bg='#002469' style={{ flex: 1.5 }}></Box>
        <Box h={5} bg='#D4450C' style={{ flex: 1 }}></Box>
        <Box h={5} bg='#0DC0DC' style={{ flex: 2.5 }}></Box>
        <Box h={5} bg='#F4D019' style={{ flex: 1.5 }}></Box>
    </Group>
)
