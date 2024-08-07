import { Router } from "express";
import ExamAnswer from "../models/Answers";

const examAnswerRouter = Router();

// Get exam students by course and exam date
examAnswerRouter.post("/", async (req, res) => {
	const { course_code, date } = req.body;

	try {
		const exam = await ExamAnswer.findOne({ course_code, date });
		res.json(exam?.answers);
	} catch (err: any) {
		res.status(500).send(err.message);
	}
});

export default examAnswerRouter;
