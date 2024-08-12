import { Router } from "express";
import OpenAI from "openai";
import { Course } from "../models/Course";
import ExaminationAnswer from "../models/Answers";
import Results from "../models/Results";

const router = Router();

function countMatchingValues(obj1: any, obj2: any) {
	let matchCount = 0;

	// Iterate over the keys of the first object
	for (let key in obj1) {
		// Check if the key exists in the second object and if the values match
		if (obj2.hasOwnProperty(key) && obj1[key] === obj2[key]) {
			matchCount++;
		}
	}

	return matchCount;
}

function mapToObject<K extends string | number | symbol, V>(
	map: Map<K, V>,
): Record<K, V> {
	const obj = {} as Record<K, V>;

	map.forEach((value, key) => {
		obj[key] = value;
	});

	return obj;
}

router.post("/", async (req, res) => {
	const { school_name, course_code, date } = req.body;

	if (!school_name || !course_code || !date) {
		return res.status(400).send("incomplete request body");
	}

	try {
		const course: any = await Course.findOne({ school_name, course_code });
		const examAnswers = await ExaminationAnswer.findOne({
			school_name,
			course_code,
			date,
		});

		examAnswers?.answers.forEach(async (sItem, sIndex) => {
			// GRADE OBJECTIVE

			const studentObjectiveResult = countMatchingValues(
				mapToObject(course!.objective_question_and_answer),
				mapToObject(sItem.objective_answers as any),
			);

			// GRADE THEORY

			let theoryGrade = 0;

			for (let i = 0; i < sItem.theory_answers.length; i++) {
				const gptPrompt = `You are grade bot, an examination grading expert at ${school_name}, specialized in grading the answers of students that took the  ${
					course.name
				} (${course_code}) examination. You are being tasked with determining if the answer of this student to a question is correct or not, and what mark to assign to the student’s answer to the question. The question is wrapped around a <question> tag and this student’s answer to the question is wrapped around a <student-answer> tag. 
The context wrapped around a <context> tag contains information that relates to the answer of the question.
The total marks available for this question is ${
					(mapToObject(course.theory_question_and_answer as any) as any)[
						`${i + 1}`
					].marks
				}. You are to specifically follow the guidelines below to determine how correct the student’s answer to the question is and what mark to assign the answer to the question:
1. Review Context: Go through the context (wrapped around a <context> tag) and shortlist the relevant information matching the question ( wrapped around a <question> tag ). 
2. Use the shortlisted relevant information in step 1, and the grading rubric (wrapped around a <grading-rubric> tag ) to determine how correct the student's answer (wrapped around a <student-answer> tag) to the question is.
3. Assign any mark between 1 and ${
					(mapToObject(course.theory_question_and_answer as any) as any)[
						`${i + 1}`
					].marks
				} depending on how precise and correct the student’s answer (wrapped around a <student-answer> tag) to the question is.
4. Precision: The final mark you assign the student should strictly depend on the precision of the student’s answer to the question. The stronger the precision, the higher the mark you should assign, while the weaker the precision, the lower the mark you should assign. Use the steps below to determine the precision level of the student’s answer: 
    a. Make sure you fully understand the grading rubric (wrapped around a <grading-rubric> tag ), and then evaluate the student’s answer against the grading rubric. Be very precise about this and strictly use what is outlined in the rubric.
    b. If any criteria in the grading rubric specifies a total attainable mark, make sure the final mark assigned to the student does not exceed this specified mark.
    c. Your confidence level on how the student’s answer closely relates to the answer of the question based on the shortlisted relevant information from the context in step 1 and the grading rubric.
    d. If the grading rubric states a maximum mark, that does not mean that is the mark the student should be assigned. It means that the student should not be assigned any mark greater than the maximum mark stated. So the final mark you assign should still be strictly based on your confidence level on how the student’s answer closely relates to the answer of the question based on the shortlisted relevant information from the context in step 1 and the grading rubric.
5. Strictly rely on the context (wrapped around a <context> tag) to determine how correct the student’s answer is to the question. Do not use any other context outside what is provided in the context (wrapped around a <context> tag).
6. If the student’s answer ( wrapped around a <student-answer> tag ) to the question ( wrapped around a <question> tag ) is unambiguous and has no relevance to the question, then give the student 0 marks.


Return the final response as a JSON object with the following properties, markAssigned and reason. The markAssigned is the marks you have assigned this student and the reason is why you assigned the student that mark. Please also state the reason why you felt the student deserves the maximum attainable mark.


Question: <question>${
					(mapToObject(course.theory_question_and_answer as any) as any)[
						`${i + 1}`
					].question
				}</question>

Student’s Answer: <student-answer>${sItem.theory_answers[i]}</student-answer>

Context: <context>${(
					mapToObject(course.theory_question_and_answer as any) as any
				)[`${i + 1}`].poss_answers
					.map((psAnsIt: string) => `- ${psAnsIt}\n`)
					.join(
						"\n\n--------------------------------------------------------------------------------------\n\n",
					)}</context>


<grading-rubric>${
					(mapToObject(course.theory_question_and_answer as any) as any)[
						`${i + 1}`
					].rubric
				}</grading-rubric>
`;

				const openai = new OpenAI({ apiKey: `${process.env.OPEN_AI_KEY}` });
				const completion: any = await openai.chat.completions.create({
					messages: [{ role: "user", content: gptPrompt }],
					model: "gpt-4o-mini",
					temperature: 0.5,
				});

				if (completion.choices.length > 0) {
					theoryGrade =
						theoryGrade +
						JSON.parse(
							completion.choices[0].message.content
								.split("")
								.filter(
									(it: string, idx: number, arr: []) =>
										idx > 6 && idx < arr.length - 4,
								)
								.join(""),
						).markAssigned;
				}
			}

			// upload result to database
			await Results.create({
				studentName: sItem.student_name,
				studentId: sItem.student_id,
				objectiveScore: studentObjectiveResult,
				theoryScore: theoryGrade,
				subject: course.name,
				courseCode: course_code,
				date,
			});
		});

		res.send("good");
	} catch (error) {
		return res.status(500).send("SERVER ERROR");
	}
});

export default router;
