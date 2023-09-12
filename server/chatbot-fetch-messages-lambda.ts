import { Handler } from 'aws-lambda';

export const handler: Handler = async (event) => {
    const { chatId } = JSON.parse(event.body)
    const { findChat, chatTranscript } = await import('./conversation.js')
    try {
        const chat = await findChat(chatId)

        return {
            statusCode: 200,
            body: JSON.stringify({
                ...chat,
                transcript: await chatTranscript(chat)
            })
        }
    }

    catch (err: any) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: err.message,
                stack: err.stack,
            })
        }
    }
};
