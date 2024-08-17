// src/routes/results.ts
import { Router, Request, Response } from "express";
import ExaminationData from "../models/Answers";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
	const { schoolId, courseCode } = req.body;

	if (!schoolId || !courseCode) {
		return res.sendStatus(400);
	}

	try {
		const filter: any = {};

		filter.course_code = (courseCode as string).toUpperCase();
		filter.school_id = schoolId;

		const examData = await ExaminationData.findOne(filter);

		return res.status(200).json(examData);
	} catch (error) {
		console.error("Error fetching results:", error);
		res.status(500).json({ message: "Failed to load results" });
	}
});

export default router;
