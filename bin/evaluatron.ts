import yaml from 'js-yaml'
import fs from 'fs'
import { OpenAIApi } from 'openai'

const openai = new OpenAIApi({
    key: process.env.OPENAI_API_KEY
});

type EvalGroup = {
    prompt: string, questions: string[]
}
type EvalFormat = Record<string, EvalGroup>

function readEvals(): EvalFormat {
    const fileContents = fs.readFileSync('data/evaluation.yaml', 'utf8');
    const data = yaml.load(fileContents)
    return data;
}


async function evaluateQuestionsWithChatGPT(group: EvalGroup) {
    const responses = [];

    for (let question of group.questions) {

        try {
            const response = await openai.complete({
                prompt: prompt.replace('', question,
                max_tokens: 150,  // You can adjust this as per your needs
            });

            responses.push(response.choices[0].text.trim());
        } catch (error) {
            console.error('Error querying OpenAI:', error);
            responses.push(null);  // or handle this differently based on your needs
        }
    }

    return responses;
}


const evals = readEvals()


import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
    organization: "org-9poToIhde9WuQIUageK4X6fT",
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const response = await openai.listEngines();
