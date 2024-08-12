// src/routes/results.ts
import { Router, Request, Response } from "express";
import Result from "../models/Results";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
	console.log("=================== RESULT REQUESTED ========================");

	const { courseCode } = req.body;

	console.log(courseCode);

	const filter: any = {};
	if (courseCode) filter.courseCode = (courseCode as string).toUpperCase();

	try {
		const results = await Result.find(filter);
		res.status(200).json(results);
	} catch (error) {
		console.error("Error fetching results:", error);
		res.status(500).json({ message: "Failed to load results" });
	}
});

export default router;
