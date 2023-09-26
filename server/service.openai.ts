import { SavedMessageModel, SavedChatModel, Message, messagesForChatId } from './data'
import { RequestContext } from './request-context'
import { getConfigValue } from './config'
import { InferenceMessage, InferenceContext } from '#lib/types'
import OpenAIApi from 'openai'


// TODO: finish implementation to deal with multiple messages.
// this only implements enough to use it for the eval
export async function requestInference(ctx: InferenceContext) {
    const openai = new OpenAIApi({
        apiKey: process.env.OPENAI_API_KEY
    });
    const model = ctx.model.replace('openai/', '')

    const { buildPrompt, cleanMessageContent, PROMPT_TEXT_SUFFIX } = await import('./prompts')

    const promptWithFirstMessage = buildPrompt(ctx, ctx.transcript.length == 0) +
        ctx.transcript[0] + '\n\n' +
        ctx.message + '\n\n' + PROMPT_TEXT_SUFFIX

    const gpt = await openai.chat.completions.create({
        model,
        messages: [
            {
                role: 'user',
                content: promptWithFirstMessage,
            }
        ],
    });

    ctx.onComplete(gpt.choices[0]?.message.content || 'ERROR')

}
