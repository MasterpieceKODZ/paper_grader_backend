import { Router } from "express";
import gradeExamCandidates from "../utils/grade_candidates";

const router = Router();

router.post("/", async (req, res) => {
	const { school_id, course_name, course_code, date } = req.body;

	if (!school_id || !course_name || !course_code || !date) {
		return res.status(400).send("incomplete request body");
	}

	res.sendStatus(201);

	try {
		gradeExamCandidates(school_id, course_name, course_code, date);
	} catch (error) {
		console.log("grade exam error");
		console.log(error);
	}
});

export default router;
