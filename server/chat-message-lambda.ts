import { APIGatewayProxyEventV2 } from 'aws-lambda'
import type {Writable}  from 'node:stream'
import { addMessageToChat, chatTranscript } from '../lib/conversation.js'
import { RequestContext } from '../lib/request-context.js'
import type { MessageSendContext } from '#lib/types'
const { awslambda } = (global as any)

export const handler = awslambda.streamifyResponse(myHandler)

async function myHandler(
  event: APIGatewayProxyEventV2,
  responseStream: Writable
): Promise<void> {
  console.log('Handler got event:', event)
    const ctx = JSON.parse(event.body || '') as MessageSendContext
    const metadata = {
        statusCode: 200,
        headers: {
            "Connection": "keep-alive",
            "Cache-Control": "no-cache",
            "Content-Type": "text/event-stream",
        }
    };
    const stream = (json: any) => {
        responseStream.write('data: ' + JSON.stringify(json) + '\n\n')
    }

    responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);

    const chat = await addMessageToChat(new RequestContext(
        (updated) => stream(updated),
        (errorMsg?: string) => {
            if (errorMsg) stream ({ error: errorMsg })
            responseStream.end()
        },
        ctx
    ))

    stream({
        id: chat.id,
        transcript: await chatTranscript(chat)
    })

}
