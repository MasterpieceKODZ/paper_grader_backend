import { Course } from "../models/Course";
import School from "../models/School";
import Examination from "../models/Examination";
import convertMapTypeToObjectLiteral from "./convert_map_to_object";
import gradeTheoryAnswers from "./grade_theory";

function gradeObjectiveAnswers(course: any, studentAnswer: any) {
	const correctAnswers = convertMapTypeToObjectLiteral(course);
	const studentAnswers = convertMapTypeToObjectLiteral(studentAnswer);
	if (Object.keys(correctAnswers).length < 1) {
		return 0;
	}

	let correctAnswersCount = 0;

	for (let key in correctAnswers) {
		const isAnswerCorrect = studentAnswers.hasOwnProperty(key) && correctAnswers[key] === studentAnswers[key];
		if (isAnswerCorrect) {
			correctAnswersCount++;
		}
	}

	return correctAnswersCount;
}

async function gradeStudentsAnswersAsync(
	school_id: string,
	course_name: string,
	course_code: string,
	date: string,
) {
	const course: any = await Course.findOne({ school_id, course_code });
	const school = await School.findById(school_id);
	const examination = await Examination.findOne({
		school_id,
		course_code,
		date,
	});

	const gradedCandidates = await Promise.all(
		examination!.candidates.map(async (candidate) => {
			const studentObjectiveResult = gradeObjectiveAnswers(course!.objective_question_and_answer, candidate.objective_answers as any);
			const theoryGradeResult = await gradeTheoryAnswers(
				candidate as any,
				school!.school_name,
				course,
			);

			return {
				student_name: candidate.student_name,
				student_id: candidate.student_id,
				objective_answers: candidate.objective_answers,
				objective_score: studentObjectiveResult,
				theory_answers: candidate.theory_answers,
				theory_grade_summary: theoryGradeResult.theoryGradeAndSummary,
				theory_score: theoryGradeResult.theoryScore,
			};
		}),
	);

	await Examination.updateOne(
		{ school_id, course_name, course_code, date },
		{
			grading_status: "done",
			candidates: [...gradedCandidates],
		},
	);
}

export default gradeStudentsAnswersAsync;
