import Papa from 'papaparse'
import fs from 'fs'
import 'dotenv/config'
import { countWordsAndSentences } from '#lib/string'
import { infer } from '../server/service'
import OpenAIApi from 'openai'

const parse = async () => {
    const fileContents = fs.readFileSync('evaluation/ism.csv', 'utf8');
    return Papa.parse<{ question: string, solution: string}>(fileContents, { header: true })
}

const MODELS = {
    '13b': 'togethercomputer/llama-2-13b-chat',
    'student': 'self-hosted',
    '70b': 'togethercomputer/llama-2-70b-chat',
    'gpt-3.5': 'openai/gpt-3.5-turbo',
}
type ModelId = keyof typeof MODELS
const ModelIds = Object.keys(MODELS) as ModelId[]

const openai = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY
});

const PROMPT = `
Grade the following response based on how closely it matches the expected response.
A top scoring reply will match the meaning of the expected response.
The worst scoring answer will be not match the expected response at all or be inaccurate.
Use a scale of 1-10 and output only the score in JSON format

The question posed was:
__QUESTION__

The expected response is:
__EXPECTED__

The provided response was:
__RESPONSE__
`

const evalModel = async (question: string, expected: string, modelId: ModelId) => {
    const key = MODELS[modelId]

    // await new Promise((resolve) => setTimeout(resolve, (Math.random() + 1) * 5000))

    const response = await infer({
        transcript: [],
        model: key,
        message: question,
        subject: 'economics',
    })

    const content = PROMPT.replace('__QUESTION__', question).replace('__EXPECTED__', expected).replace('__RESPONSE__', response)

    const gpt = await openai.chat.completions.create({ model: 'gpt-3.5-turbo', messages: [{ role: 'user', content }] })

    // avoid gpt 4 rate limit



    let score = gpt.choices[0]?.message.content
    try {
        score = JSON.parse(score || '{}').score
        if (score == null) {
            score = gpt.choices[0]?.message.content
        }
    } catch (e) {
        console.log(e)
    }

    console.log(content)
    console.log(`SCORE: ${score}`)

    const {words, sentences} = countWordsAndSentences(response)
    return {
        [`${modelId}_score`]: score,
        [`${modelId}_words`]: words,
        [`${modelId}_sentences`]: sentences,
        [`${modelId}_response`]: response,
    }
}

parse().then(async (csv) => {
    const csvRows = csv.data.slice(0,100)
    const resultRows = []

    for (const row of csvRows) {
        const {solution, question} = row

        const modelResponses = await Promise.all(ModelIds.map(async (modelId) => {
            try {
                return await evalModel(question, solution, modelId)
            }
            catch {
                return {
                    [`${modelId}_score`]: 0,
                    [`${modelId}_response`]: 'error'
                }
            }
        }))

        let response = {
            question,
            solution,
        }

        for (const modelResponse of modelResponses) {
            response = {
                ...response,
                ...modelResponse,
            }
        }
        resultRows.push(response)
    }
    fs.writeFileSync("evaluation/knowledge.csv", Papa.unparse(resultRows))
})
