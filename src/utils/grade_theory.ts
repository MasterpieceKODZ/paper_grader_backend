import OpenAI from "openai";
import convertMapTypeToObjectLiteral from "./convert_map_to_object";
import Candidate from "./types/Candidate";
import getGPTPrompt from "./getGPTPrompt";
import processGPTResponse from "./process_GPT_response";

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
	let theoryScore = 0;
	const theoryGradeAndSummary = await Promise.all(
		candidateData.theory_answers.map(async (ansItem, ansIndex) => {
			const gptPrompt = getGPTPrompt(
				school_name,
				course.name,
				course.course_code,
				(
					convertMapTypeToObjectLiteral(
						course.theory_question_and_answer as any,
					) as any
				)[`${ansIndex + 1}`].mark,
				(
					convertMapTypeToObjectLiteral(
						course.theory_question_and_answer as any,
					) as any
				)[`${ansIndex + 1}`].question,
				ansItem,
				(
					convertMapTypeToObjectLiteral(
						course.theory_question_and_answer as any,
					) as any
				)[`${ansIndex + 1}`].context
					.map((psAnsIt: string) => `- ${psAnsIt}\n`)
					.join(
						"\n\n--------------------------------------------------------------------------------------\n\n",
					),
				(
					convertMapTypeToObjectLiteral(
						course.theory_question_and_answer as any,
					) as any
				)[`${ansIndex + 1}`].rubric,
			);

			const openai = new OpenAI({ apiKey: `${process.env.OPEN_AI_KEY}` });
			const completion: any = await openai.chat.completions.create({
				messages: [{ role: "user", content: gptPrompt }],
				model: "gpt-4o-mini",
				temperature: 0.5,
			});

			const gradeSummary = processGPTResponse(
				completion,
				course,
				candidateData,
				ansIndex,
			);

			theoryScore = gradeSummary
				? theoryScore + gradeSummary.mark
				: theoryScore;

			return gradeSummary;
		}),
	);

	return { theoryScore, theoryGradeAndSummary };
}

export default gradeTheoryAnswers;
