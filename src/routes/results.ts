// src/routes/results.ts
import { Router, Request, Response } from "express";
import Result from "../models/Results";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
	const { subject, courseCode, year } = req.query;

	const filter: any = {};
	if (subject) filter.subject = subject;
	if (courseCode) filter.courseCode = courseCode;
	if (year) filter.year = year;

	try {
		const results = await Result.find(filter);
		res.status(200).json(results);
	} catch (error) {
		console.error("Error fetching results:", error);
		res.status(500).json({ message: "Failed to load results" });
	}
});

export default router;

// import { Router, Request, Response } from "express";
// import Result from "../models/Results";

// const router = Router();

// // Sample data, replace with actual database queries
// const results = [
// 	{
// 		id: 1,
// 		studentName: "John Doe",
// 		objectiveScore: 40,
// 		theoryScore: 45,
// 		totalScore: 85,
// 		feedback: "Good job!",
// 	},
// 	{
// 		id: 2,
// 		studentName: "Jane Smith",
// 		objectiveScore: 45,
// 		theoryScore: 47,
// 		totalScore: 92,
// 		feedback: "Excellent!",
// 	},
// ];

// router.get("/", (req: Request, res: Response) => {
// 	res.status(200).json(results);
// });

// export default router;
