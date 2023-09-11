import { APIGatewayProxyHandler } from 'aws-lambda';
import { chatsBetweenDates } from '#server/conversation.ts'


export const handler: APIGatewayProxyHandler = async (event) => {

    const  { start, end  } = event?.queryStringParameters || {}
    try {
        const chats = await chatsBetweenDates(start, end)

        return {
            statusCode: 200,
            body: JSON.stringify({ chats })
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

}
