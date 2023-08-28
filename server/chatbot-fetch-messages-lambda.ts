import { Handler } from 'aws-lambda';

export const handler: Handler = async (event) => {
    const { chatId } = JSON.parse(event.body)
    const { findChat, chatTranscript } = await import('../lib/conversation.js')
    try {
        const chat = await findChat(chatId)

        return {
            statusCode: 200,
            body: JSON.stringify({
                id: chat.id,
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
