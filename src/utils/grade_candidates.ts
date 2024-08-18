import { Course } from "../models/Course";
import School from "../models/School";
import ExaminationData from "../models/Answers";
import convertMapTypeToObjectLiteral from "./convert_map_to_object";
import gradeTheoryAnswers from "./grade_theory";

function gradeObjectiveAnswers(obj1: any, obj2: any) {
	let correctAnswersCount = 0;

	for (let key in obj1) {
		if (obj2.hasOwnProperty(key) && obj1[key] === obj2[key]) {
			correctAnswersCount++;
		}
	}

	return correctAnswersCount;
}

async function gradeExamCandidates(
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
				sItem,
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

export default gradeExamCandidates;
