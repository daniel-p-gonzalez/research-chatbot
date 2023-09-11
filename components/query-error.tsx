import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export const QueryError: React.FC<{ error?: Error | null }> = ({ error }) => {
    if (!error) return null

    return (
        <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red">
            {error.message}
        </Alert>
    );
}
