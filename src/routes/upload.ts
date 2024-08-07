//import { Course } from "../models/Course";

import { Router, Request, Response } from "express";
import multer from "multer";
import { v1 as vision } from "@google-cloud/vision";
import Jimp from "jimp";

type MulterFile = {
	buffer: Buffer;
	filename: string;
	mimetype: string;
	size: number;
};

type RequestFiles = {
	objective_answers?: MulterFile[];
	theory_answers?: MulterFile[];
};

async function preprocessImageAndExtractText(buffer: Buffer): Promise<String> {
	const image = await Jimp.read(buffer);
	image
		.grayscale() // Convert to grayscale
		.contrast(1) // Increase contrast
		.invert() // Invert colors to enhance text
		.normalize(); // Normalize the image

	const keyFilename = `${__dirname}../../../project-dissertation-f89ea6389b60[1].json`;
	const client = new vision.ImageAnnotatorClient({ keyFilename });

	const [result] = await client.documentTextDetection({
		image: { content: await image.getBufferAsync(Jimp.MIME_PNG) },
	});

	const fullTextAnnotation = result.fullTextAnnotation;
	const extractedText = fullTextAnnotation ? fullTextAnnotation.text : "";

	return extractedText!.trim();
}

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
	"/",
	upload.fields([
		{ name: "objective_answers", maxCount: 1 },
		{ name: "theory_answers", maxCount: 10 },
	]),
	async (req: Request, res: Response) => {
		const { course_name, course_code, date, student_name, student_id } =
			req.body;
		const files = req.files as RequestFiles;

		if (
			!course_name ||
			!course_code ||
			!date ||
			!student_name ||
			!student_id ||
			!files?.objective_answers ||
			!files?.theory_answers
		) {
			return res.status(400).send("All fields are required");
		}

		try {
			const results = await preprocessImageAndExtractText(
				files.objective_answers[0].buffer,
			);

			console.log(
				"------------------------ EXTRACTED TEXT Started-----------------------",
			),
				console.log(results);

			console.log(
				"------------------------ EXTRACTED TEXT Finished-----------------------",
			);

			// //Extract text from theory answers
			// const theoryTextPromises = files.theory_answers.map((file) =>
			// 	preprocessImageAndExtractText(file.buffer)

			// console.log("-----------------------THEORY TEXT ----------------------");
			// console.log(theoryAnswers);

			// console.log("------------------------------------------------------");

			// //Save to ExaminationAnswer collection
			// const examAnswer = new ExaminationAnswer({
			// 	course_name,
			// 	cours// );
			// const theoryTexts = await Promise.all(theoryTextPromises);
			// const theoryAnswers = theoryTexts
			// 	.map((result) => result.data.text)
			// 	.join("\n");
			//e_code,
			// 	date,
			// 	answers: [
			// 		{
			// 			student_name,
			// 			student_id,
			// 			objective_answers: objectiveText.data.text,
			// 			theory_answers: theoryAnswers,
			// 		},
			// 	],
			// });

			// await examAnswer.save();
			res.status(201).send("Answers saved successfully");
		} catch (error) {
			console.error(error);
			res.status(500).send("Error saving answers");
		} finally {
			//worker.terminate();
		}
	},
);
export default router;
