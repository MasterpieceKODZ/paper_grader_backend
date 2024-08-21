import OpenAI from "openai";
import getTheoryAnswersToArrayGPTprompt from "./get_answers_array_gpt_prompt";

async function convertTheoryAnswersStringToArray(answersString: string) {
	const gptPrompt = getTheoryAnswersToArrayGPTprompt(answersString);

	const openai = new OpenAI({ apiKey: `${process.env.OPEN_AI_KEY}` });
	const chatGptResponse: any = await openai.chat.completions.create({
		messages: [{ role: "user", content: gptPrompt }],
		model: "gpt-4o-mini",
		temperature: 0.5,
	});

	const answers = Object.values(
		JSON.parse(
			chatGptResponse.choices[0].message.content
				.split("")
				.filter(
					(it: string, idx: number, arr: []) => idx > 6 && idx < arr.length - 4,
				)
				.join(""),
		),
	);

	return answers;
}

export default convertTheoryAnswersStringToArray;
