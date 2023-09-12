export const DynamoDBSchema = {
    format: 'onetable:1.1.0',
    version: '0.0.1',
    indexes: {
        primary: { hash: 'pk', sort: 'sk' },
        gs1: { hash: 'gs1' },
    },
    models: {
        Chat: {
            pk: { type: String, value: 'ct:${id}' },
            sk: { type: String, value: 'created' },
            created: { type: Date, readonly: true },
            id: { type: String, generate: 'ulid', readonly: true},
        },

        Message: {
            pk: { type: String, value: 'msg:${id}' },
            sk: { type: String, value: 'chatId' },
            gs1: { type: String, value: 'msg:${chatId}' },

            id: { type: String, generate: 'ulid', readonly: true},
            created: { type: Date, readonly: true },
            chatId: { type: String, required: true, readonly: true, reference: 'Chat:primary:id=id',},
            content: { type: String, required: true },
            model: { type: String },
            isBot: { type: 'boolean', map: 'bot', default: false },
        },

    } as const,
    params: {
        isoDates: true,
        timestamps: 'create',
    },
}
