import { Router } from "express";
import ExamData from "../models/Examination";

const uploadedExamAnswersRouter = Router();

uploadedExamAnswersRouter.post("/", async (req, res) => {
	const { school_id, course_code, date } = req.body;

	if (!school_id || !course_code) {
		return res.sendStatus(400);
	}

	try {
		const exam = await ExamData.findOne({ school_id, course_code, date });

		return res.json(exam?.candidates);
	} catch (err: any) {
		return res.status(500).send(err.message);
	}
});

export default uploadedExamAnswersRouter;
