import { Router } from "express";
import { Course } from "../models/Course";
import ExaminationData from "../models/Answers";
import gradeTheoryAnswers from "../utils/grade_theory";
import School from "../models/School";
import convertMapTypeToObjectLiteral from "../utils/convert_map_to_object";

const router = Router();

function gradeObjectiveAnswersByComparison(obj1: any, obj2: any) {
	let correctAnswersCount = 0;

	// Iterate over the keys of the first object
	for (let key in obj1) {
		// Check if the key exists in the second object and if the values match
		if (obj2.hasOwnProperty(key) && obj1[key] === obj2[key]) {
			correctAnswersCount++;
		}
	}

	return correctAnswersCount;
}

router.post("/", async (req, res) => {
	const { school_id, course_name, course_code, date } = req.body;

	if (!school_id || !course_name || !course_code || !date) {
		return res.status(400).send("incomplete request body");
	}

	try {
		res.sendStatus(201);

		console.log("================= grade exam started =================");

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
				const studentObjectiveResult = gradeObjectiveAnswersByComparison(
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

		console.log("=========graded candidates ==============");
		console.log(gradedCandidates);

		await ExaminationData.updateOne(
			{ school_id, course_name, course_code, date },
			{
				grading_status: "done",
				candidates: [...gradedCandidates],
			},
		);
	} catch (error) {
		return res.status(500).send("SERVER ERROR");
	}
});

export default router;
