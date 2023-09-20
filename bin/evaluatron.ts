import yaml from 'js-yaml'
import fs from 'fs'
import 'dotenv/config'
import OpenAIApi from 'openai'
import { infer } from '../server/service'
import dayjs from 'dayjs'

const openai = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY
});


type EvalGroup = {
    prompt: string
    topic: string
    subject: string
    questions: string[]
}


const MODELS = {
    '13b': 'togethercomputer/llama-2-13b-chat',
    'student': 'self-hosted',
    '70b': 'togethercomputer/llama-2-70b-chat',
}
type ModelId = keyof typeof MODELS
const ModelIds = Object.keys(MODELS) as ModelId[]

type Grade = {
    model: ModelId
    response: string
    score: number
}
type QuestionEval = {
    question: string
    scores: Record<ModelId, Grade>
}

async function evaluateGroup(group: EvalGroup) {
    const grades: QuestionEval[] = [];
    for (let question of group.questions) {
        console.log(question)

        const scores = await Promise.all(Object.entries(MODELS).map(async ([ id, key ]) => {

            const response = await infer({
                transcript: [],
                model: key,
                message: question,
                topic: group.topic,
                subject: group.subject,
            })
            const gpt = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'user', content: group.prompt.replace('__QUESTION__', question).replace('__RESPONSE__', response),
                    }
                ],
            });
            // console.log(gpt.choices[0]?.message.content)
            return {
                model: id,
                response,
                score: JSON.parse(gpt.choices[0]?.message.content || '{ "score": 0}').score || 0
            } as Grade
        }))
        // console.log({ scores })
        grades.push({
            question, scores: scores.reduce((acc, { model, ...props }) => {
                return {...acc, [model]: { model, ...props }}
            }, {} as Record<ModelId, Grade>)
        })

    }

    return grades
}

type EvalFormat = Record<string, EvalGroup>

async function evaluate() {
    const fileContents = fs.readFileSync('evaluation/protocol.yaml', 'utf8');
    const evals = yaml.load(fileContents) as EvalFormat

    const grades = await Promise.all(Object.keys(evals).map(async (groupType: string) => {
        const questions = await evaluateGroup(evals[groupType])
        const totals: Record<ModelId, number> = {} as Record<ModelId, number>

        for (const modelId of ModelIds) {
            let total = 0
            for (const question of questions) {
                total += question.scores[modelId].score
            }
            totals[modelId] = total
        }

        // console.log(JSON.stringify(totals, null, 2))

        return { type: groupType, totals, questions }
    }))

    return grades
}

const esc = (str: string) => str.replace(/\n/g, '<br>')

evaluate().then((grades) => {

    let report = ''
    for (const { type, totals, questions } of grades) {
        report += `# ${type}\n\n`
        report += `### Totals\n`

        const sortedModels = ModelIds.sort((a, b) => totals[b] - totals[a])

        report += `| Model | Score |\n`
        report += `| -------- | ------ | \n`
        for (const modelId of sortedModels) {
            report += `| ${modelId} | ${totals[modelId]} |\n`
        }
        report += '\n\n'

        report += `|  | Question / Responses |\n`
        report += `| -------- | -------- |\n`
        let first = true
        for ( const q of questions ) {
            if (!first) {
                report += '| | |\n'
            }
            report += `| | **${esc(q.question)}** | \n`
            for (const modelId of sortedModels) {
                const check = q.scores[modelId]
                report += `| ${modelId} <br> ${check.score}pts | ${esc(check.response)} |\n`
            }
            first = false
        }

        report += `\n\n`
        report += '\n\n'
    }
    fs.writeFileSync(`data/${dayjs().format('YYYY-MM-DD')}-bot-evaluation.md`, report)
    console.log(report)
})

