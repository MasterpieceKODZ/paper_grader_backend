import { Router, Request, Response } from "express";
import multer from "multer";
import Result from "../models/Results";
import { createWorker } from "tesseract.js";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
	"/multiple-choice",
	upload.array("files"),
	async (req: Request, res: Response) => {
		const files = (req as any).files;
		const { subject, courseCode, year } = req.body;

		if (!files || files.length === 0) {
			return res.status(400).json({ message: "No files uploaded" });
		}

		if (!subject || !courseCode || !year) {
			return res
				.status(400)
				.json({ message: "Subject, course code, and year are required" });
		}
		// Process the uploaded file as needed
		try {
			const worker = await createWorker();
			await worker.load();

			const results = [];
			let fileIndex = 0;
			for (const file of files) {
				const { data } = await worker.recognize(file.buffer);
				const text = data.text;

				console.log(
					`*********************** TEXT ${fileIndex++} *******************`,
				);
				console.log(text);

				// Simulate grading process and extract relevant data from text
				const objectiveScore = Math.floor(Math.random() * 50) + 1;
				const theoryScore = Math.floor(Math.random() * 50) + 1;
				const totalScore = objectiveScore + theoryScore;
				const feedback = "Sample feedback";

				const result: any = new Result({
					studentName: `Student ${results.length + 1}`,
					objectiveScore,
					theoryScore,
					totalScore,
					feedback,
					subject,
					courseCode,
					year,
				});
				await result.save();
				results.push(result);
			}

			await worker.terminate();

			res.status(200).json({
				message: "Files uploaded and results saved successfully!",
				results,
			});
		} catch (error) {
			console.error("Error processing files:", error);
			res.status(500).json({ message: "Failed to process files" });
		}
	},
);

router.post(
	"/essay",
	upload.array("file"),
	async (req: Request, res: Response) => {
		const files = (req as any).files;
		const { subject, courseCode, year } = req.body;
		console.log("*****************Essay**********************");
		console.log(files);

		if (!files || files.length === 0) {
			return res.status(400).json({ message: "No files uploaded" });
		}

		if (!subject || !courseCode || !year) {
			return res
				.status(400)
				.json({ message: "Subject, course code, and year are required" });
		}
		// Process the uploaded file as needed
		try {
			const worker = await createWorker();
			await worker.load();

			const results = [];
			let fileIndex = 0;
			for (const file of files) {
				const { data } = await worker.recognize(file.buffer);
				const text = data.text;

				console.log(
					`*********************** TEXT ${fileIndex++} *******************`,
				);
				console.log(text);

				// Simulate grading process and extract relevant data from text
				const objectiveScore = Math.floor(Math.random() * 50) + 1;
				const theoryScore = Math.floor(Math.random() * 50) + 1;
				const totalScore = objectiveScore + theoryScore;
				const feedback = "Sample feedback";

				const result: any = new Result({
					studentName: `Student ${results.length + 1}`,
					objectiveScore,
					theoryScore,
					totalScore,
					feedback,
					subject,
					courseCode,
					year,
				});
				await result.save();
				results.push(result);
			}

			await worker.terminate();

			res.status(200).json({
				message: "Files uploaded and results saved successfully!",
				results,
			});
		} catch (error) {
			console.error("Error processing files:", error);
			res.status(500).json({ message: "Failed to process files" });
		}
	},
);

export default router;
