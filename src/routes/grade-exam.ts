import { Router } from "express";
import gradeStudentsAnswersAsync from "../utils/grade_students";

const router = Router();

router.post("/", async (req, res) => {
	const { school_id, course_name, course_code, date } = req.body;

	if (!school_id || !course_name || !course_code || !date) {
		return res.status(400).send("incomplete request body");
	}

	res.sendStatus(201);
	gradeStudentsAnswersAsync(school_id, course_name, course_code, date).catch(
		(error) => {
			console.log("grade students answer error");
			console.log(error);
		},
	);
});

export default router;
