import { Dynamo } from 'dynamodb-onetable/Dynamo'
import { Table } from 'dynamodb-onetable'
import type { Entity } from 'dynamodb-onetable'
import { DynamoDBClient, DynamoDBClientConfig } from '@aws-sdk/client-dynamodb'
import { DynamoDBSchema } from './data/schema.js'
import { IS_PROD } from './env'

let options: DynamoDBClientConfig = {

}

if (!IS_PROD) {
    options = {
        ...options,
        endpoint: 'http://localhost:8400',
        region: 'local-env',
    }
}

export const DynamoClient = new Dynamo({
    client: new DynamoDBClient({
        ...options,
    }),
})

export const DATA_TABLE_NAME = process.env.DYNAMO_DATA_TABLE || 'TutorChatBot'

const DataTable = new Table({
    client: DynamoClient,
    name: DATA_TABLE_NAME,
    schema: DynamoDBSchema,
    partial: true,
})

async function tableCheck() {
  if (!(await DataTable.exists())) {
    await DataTable.createTable();
  }
}
tableCheck()


export { Table, DataTable }
export type ChatModel = Entity<typeof DynamoDBSchema.models.Chat>
export type SavedChatModel = ChatModel & { id: string }
export const Chat = DataTable.getModel('Chat')

export type MessageModel = Entity<typeof DynamoDBSchema.models.Message>
export type SavedMessageModel = MessageModel & { id: string }
export const Message = DataTable.getModel('Message')

const createdAtCompare = (a: MessageModel, b: MessageModel) => ((a.created == b.created) ? 0 : ((a.created > b.created)? 1: -1));
export async function messagesForChatId(chatId: string) {
    return (await Message.find({ chatId }, { index: 'gs1' })).sort(createdAtCompare)
}
//export type MessageModel = Entity<typeof DynamoDBSchema.models.Chat>['messages'][number]
