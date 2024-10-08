import OpenAI from "openai";
import { getEssayAnswersGroupingPrompt } from "./getGPTPrompts";

const buildResponse = (gptResponse: any) => {
	const answersArray = Object.values(
		JSON.parse(
			gptResponse.choices[0].message.content
				.split("")
				.filter(
					(it: string, idx: number, arr: []) => idx > 6 && idx < arr.length - 4,
				)
				.join(""),
		),
	);

	return answersArray;
};

async function groupEssayAnswers(
	answersString: string,
	school_name: string,
	course_name: string,
) {
	const gptPrompt = getEssayAnswersGroupingPrompt(
		answersString,
		school_name,
		course_name,
	);

	const openai = new OpenAI({ apiKey: `${process.env.OPEN_AI_KEY}` });
	const chatGptResponse: any = await openai.chat.completions.create({
		messages: [{ role: "user", content: gptPrompt }],
		model: "gpt-4o-mini",
		temperature: 0.2,
	});

	const buildRes = buildResponse(chatGptResponse);

	return buildRes;
}

export default groupEssayAnswers;
