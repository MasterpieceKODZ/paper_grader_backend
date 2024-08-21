import OpenAI from "openai";
import { getTheoryAnswersToArrayGPTprompt } from "./getGPTPrompts";

const buildResponse = (gptResponse: any) => {
	return Object.values(
		JSON.parse(
			gptResponse.choices[0].message.content
				.split("")
				.filter(
					(it: string, idx: number, arr: []) => idx > 6 && idx < arr.length - 4,
				)
				.join(""),
		),
	);
};

async function groupEssayAnswers(
	answersString: string,
	school_name: string,
	course_name: string,
) {
	const gptPrompt = getTheoryAnswersToArrayGPTprompt(
		answersString,
		school_name,
		course_name,
	);

	const openai = new OpenAI({ apiKey: `${process.env.OPEN_AI_KEY}` });
	const chatGptResponse: any = await openai.chat.completions.create({
		messages: [{ role: "user", content: gptPrompt }],
		model: "gpt-4o-mini",
		temperature: 0.5,
	});

	return buildResponse(chatGptResponse);
}

export default groupEssayAnswers;
