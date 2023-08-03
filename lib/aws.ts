import {SSMClient, GetParametersCommand} from "@aws-sdk/client-ssm"
import { ENV_NAME } from './env'

export async function getParamStoreValue(path: string, decryption = false) {
    const client = new SSMClient({ region: process.env.AWS_REGION || 'us-east-1' })
    const paths = [
        `/research/chatbot/${ENV_NAME}/together-ai-api-token`,
        `/research/chatbot/all/together-ai-api-token`,
    ]
    const result = await client.send(new GetParametersCommand({
        Names: paths,
        WithDecryption: decryption
    }));
    if (!result.Parameters?.length) {
        throw new Error(`No values found for ${paths.join(' or ')}`);
    }
    return result.Parameters[0].Value
}
