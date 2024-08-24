import OpenAI from "openai";
import convertMapTypeToObjectLiteral from "./convert_map_to_object";
import Candidate from "./types/Candidate";
import groupEssayAnswers from "./groupEssayAnswers";
import { getGradingPrompt, getDiscrepancyFixPrompt } from "./getGPTPrompts";

const getGradeResult = (chatGptResponse: any) => {
	if (chatGptResponse.choices.length == 0) {
		return {
			markAssigned: 0,
			reason: "No grade assigned",
			discrepancy: "No discrepancy found",
		};
	}

	const gradeResultJson = JSON.parse(
		chatGptResponse.choices[0].message.content,
	);
	return gradeResultJson;
};

const getCourseDetails = (course: any, index: number) => {
	const courseDetails = (
		convertMapTypeToObjectLiteral(
			course.theory_question_and_answer as any,
		) as any
	)[`${index + 1}`];
	const totalScoreForQuestion = courseDetails.mark;
	const question = courseDetails.question;
	const context = courseDetails.context
		.map((psAnsIt: string) => `- ${psAnsIt}\n`)
		.join(
			"\n\n--------------------------------------------------------------------------------------\n\n",
		);
	const gradingRubric = courseDetails.rubric;
	return {
		totalScoreForQuestion,
		question,
		context,
		gradingRubric,
	};
}

const fixGradingDiscrepancies = async (school: string, course: string, gradeResult: any) => {
	const prompt = getDiscrepancyFixPrompt(school, course, JSON.stringify(gradeResult));
	const openai = new OpenAI({ apiKey: `${process.env.OPEN_AI_KEY}` });
	const gptResponse: any = await openai.chat.completions.create({
				messages: [{ role: "user", content: prompt }],
				model: "gpt-4o-mini",
				temperature: 0.2,
			});

	if (gptResponse.choices.length == 0) {
		return gradeResult;
	}
	const fixedResult = gptResponse.choices[0].message.content;
	const extractedResponse = fixedResult.match(/```json([\s\S]*)```/)?.[1].toString() || fixedResult;
	const fixedGradeResult = JSON.parse(extractedResponse);
	return {
		oldScore: fixedGradeResult.oldScore,
		newScore: fixedGradeResult.newScore,
		fix: fixedGradeResult.fix,
	};
}

const buildGradeResultResponse = async (acc: any, chatGptResponse: any, question: any, school: string, course: string, studentAnswer: any) => {
	const gradeResult = getGradeResult(chatGptResponse);
	const fixedResult = await fixGradingDiscrepancies(school, course, gradeResult);
	acc.theoryScore += fixedResult!.newScore;

	acc.theoryGradeAndSummary.push({
		question: question,
		answer: studentAnswer,
		mark: fixedResult!.newScore,
		reason: gradeResult!.summary,
	});
}

async function gradeTheoryAnswers(
	candidateData: Candidate,
	school_name: string,
	course: any,
) {
	if (!candidateData.theory_answers) {
		return {
			theoryScore: 0,
			theoryGradeAndSummary: { question: "", answer: "", mark: "", reason: "" },
		};
	}

	const answers: any = await groupEssayAnswers(
		candidateData.theory_answers,
		school_name,
		course.name,
	);

	return answers.reduce(
		async (accPromise: any, studentAnswer: string, index: number) => {
			let acc = await accPromise;
			const { totalScoreForQuestion, question, context, gradingRubric } = getCourseDetails(course, index);
			const gptPrompt = getGradingPrompt(
				school_name,
				course.name,
				course.course_code,
				totalScoreForQuestion,
				question,
				studentAnswer,
				context,
				gradingRubric,
			);

			const openai = new OpenAI({ apiKey: `${process.env.OPEN_AI_KEY}` });
			const gradeResponse: any = await openai.chat.completions.create({
				messages: [{ role: "user", content: gptPrompt }],
				model: "gpt-4o-mini",
				temperature: 0.2,
			});

			await buildGradeResultResponse(acc, gradeResponse, question, school_name, course, studentAnswer);
			return acc;
		},
		Promise.resolve({ theoryScore: 0, theoryGradeAndSummary: [] }),
	);
}

export default gradeTheoryAnswers;
