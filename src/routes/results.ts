import { Router, Request, Response } from "express";
import Examination from "../models/Examination";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
	const { schoolId, courseCode, date } = req.body;

	if (!schoolId || !courseCode || !date) {
		return res.sendStatus(400);
	}

	try {
		const filter: any = {};

		filter.course_code = (courseCode as string).toUpperCase();
		filter.school_id = schoolId;
		filter.date = date;

		const examData = await Examination.findOne(filter);

		return res.status(200).json(examData);
	} catch (error) {
		console.error("Error fetching results:", error);
		res.status(500).json({ message: "Failed to load results" });
	}
});

export default router;
