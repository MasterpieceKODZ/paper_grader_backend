import OpenAI from "openai";
import convertMapTypeToObjectLiteral from "./convert_map_to_object";
import Candidate from "./types/Candidate";
import getGPTPrompt from "./getGPTPrompt";

const getGradeResult = (chatGptResponse: any) => {
	if (chatGptResponse.choices.length == 0) {
		return {
			totalScore: 0,
			summary: "No grade assigned",
		};
	}

	const gradeResultJson = JSON.parse(
		chatGptResponse.choices[0].message.content
			.split("")
			.filter(
				(it: string, idx: number, arr: []) => idx > 6 && idx < arr.length - 4,
			)
			.join(""),
	);

	return {
		totalScore: gradeResultJson.markAssigned,
		summary: gradeResultJson.reason,
	};
};

async function gradeTheoryAnswers(
	candidateData: Candidate,
	school_name: string,
	course: any,
) {
	if (candidateData.theory_answers.length < 1) {
		return {
			theoryScore: 0,
			theoryGradeAndSummary: { question: "", answer: "", mark: "", reason: "" },
		};
	}

	return candidateData.theory_answers.reduce(
		async (accPromise: any, studentAnswer: string, index: number) => {
			let acc = await accPromise;
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

			const gptPrompt = getGPTPrompt(
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
			const completion: any = await openai.chat.completions.create({
				messages: [{ role: "user", content: gptPrompt }],
				model: "gpt-4o-mini",
				temperature: 0.5,
			});

			const gradeResult = getGradeResult(completion);
			acc.theoryScore += gradeResult!.totalScore;

			acc.theoryGradeAndSummary.push({
				question: question,
				answer: studentAnswer,
				mark: gradeResult!.totalScore,
				reason: gradeResult!.summary,
			});
			return acc;
		},
		Promise.resolve({ theoryScore: 0, theoryGradeAndSummary: [] }),
	);
}

export default gradeTheoryAnswers;
