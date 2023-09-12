import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { Loader } from '@mantine/core';

export const QueryError: React.FC<{ error?: Error | null }> = ({ error }) => {
    if (!error) return null

    return (
        <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red">
            {error.message}
        </Alert>
    );
}


export const Loading: React.FC<{ message?: string | false | null}> = ({ message }) => {
    if (!message) return null

    return (
        <Alert icon={<Loader size="1rem" />} title="Loading!" color="blue">
            {message}
        </Alert>
    );
}
