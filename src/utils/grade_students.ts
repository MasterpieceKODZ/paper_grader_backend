import { Course } from "../models/Course";
import School from "../models/School";
import ExaminationData from "../models/Examination";
import convertMapTypeToObjectLiteral from "./convert_map_to_object";
import gradeTheoryAnswers from "./grade_theory";

function gradeObjectiveAnswers(course_objs: any, student_answer_obj: any) {
	if (Object.keys(course_objs).length < 1) {
		return 0;
	}

	let correctAnswersCount = 0;

	for (let key in course_objs) {
		if (
			student_answer_obj.hasOwnProperty(key) &&
			course_objs[key] === student_answer_obj[key]
		) {
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
	const examData = await ExaminationData.findOne({
		school_id,
		course_code,
		date,
	});

	const gradedCandidates = await Promise.all(
		examData!.candidates.map(async (sItem) => {
			// GRADE OBJECTIVE
			const studentObjectiveResult = gradeObjectiveAnswers(
				convertMapTypeToObjectLiteral(course!.objective_question_and_answer),
				convertMapTypeToObjectLiteral(sItem.objective_answers as any),
			);

			// GRADE THEORY
			const theoryGradeResult = await gradeTheoryAnswers(
				sItem as any,
				school!.school_name,
				course,
			);

			return {
				student_name: sItem.student_name,
				student_id: sItem.student_id,
				objective_answers: sItem.objective_answers,
				objective_score: studentObjectiveResult,
				theory_answers: sItem.theory_answers,
				theory_grade_summary: theoryGradeResult.theoryGradeAndSummary,
				theory_score: theoryGradeResult.theoryScore,
			};
		}),
	);

	await ExaminationData.updateOne(
		{ school_id, course_name, course_code, date },
		{
			grading_status: "done",
			candidates: [...gradedCandidates],
		},
	);
}

export default gradeStudentsAnswersAsync;
