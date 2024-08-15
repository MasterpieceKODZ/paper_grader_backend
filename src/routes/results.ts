// src/routes/results.ts
import { Router, Request, Response } from "express";
import ExaminationAnswer from "../models/Answers";
import School from "../models/School";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
	const { schoolId, courseCode } = req.body;

	if (!schoolId || !courseCode) {
		return res.sendStatus(400);
	}

	try {
		const school = await School.findById({ _id: schoolId });

		const filter: any = {};

		filter.course_code = (courseCode as string).toUpperCase();
		filter.school_name = school?.school_name;

		const examAnswer = await ExaminationAnswer.findOne(filter);

		return res.status(200).json(examAnswer);
	} catch (error) {
		console.error("Error fetching results:", error);
		res.status(500).json({ message: "Failed to load results" });
	}
});

export default router;
