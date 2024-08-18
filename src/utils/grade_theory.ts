import OpenAI from "openai";
import convertMapTypeToObjectLiteral from "./convert_map_to_object";
import Candidate from "./types/Candidate";
import getGPTPrompt from "./getGPTPrompt";

async function gradeTheoryAnswers(
	candidateData: Candidate,
	school_name: string,
	course: any,
) {
	let theoryScore = 0;
	let theoryGradeAndSummary = await Promise.all(
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

			if (completion.choices.length > 0) {
				const gradeResultJson = JSON.parse(
					completion.choices[0].message.content
						.split("")
						.filter(
							(it: string, idx: number, arr: []) =>
								idx > 6 && idx < arr.length - 4,
						)
						.join(""),
				);

				theoryScore = theoryScore + gradeResultJson.markAssigned;

				return {
					question: (
						convertMapTypeToObjectLiteral(
							course.theory_question_and_answer as any,
						) as any
					)[`${ansIndex + 1}`].question,
					answer: candidateData.theory_answers[ansIndex],
					mark: gradeResultJson.markAssigned,
					reason: gradeResultJson.reason,
				};
			}

			return null;
		}),
	);

	return { theoryScore, theoryGradeAndSummary };
}

export default gradeTheoryAnswers;
