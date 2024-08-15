import { Router } from "express";
import ExamAnswer from "../models/Answers";

const examAnswerRouter = Router();

// Get exam students by course and exam date
examAnswerRouter.post("/", async (req, res) => {
	const { school_name, course_code, date } = req.body;

	if (!school_name || !course_code || !date) {
		return res.sendStatus(400);
	}

	try {
		const exam = await ExamAnswer.findOne({ school_name, course_code, date });

		return res.json(exam?.answers);
	} catch (err: any) {
		return res.status(500).send(err.message);
	}
});

export default examAnswerRouter;
