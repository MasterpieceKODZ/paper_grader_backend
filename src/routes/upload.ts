import { Router, Request, Response } from "express";
import multer from "multer";
import { v1 as vision } from "@google-cloud/vision";
import Jimp from "jimp";
import ExaminationData from "../models/Answers";

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

	const GoogleVisionAPIKeyFilename = `${__dirname}../../../project-dissertation-f89ea6389b60[1].json`;
	const client = new vision.ImageAnnotatorClient({
		keyFilename: GoogleVisionAPIKeyFilename,
	});

	const [result] = await client.documentTextDetection({
		image: { content: await image.getBufferAsync(Jimp.MIME_PNG) },
	});

	const fullTextAnnotation = result.fullTextAnnotation;
	const extractedText = fullTextAnnotation ? fullTextAnnotation.text : "";

	return extractedText!.trim();
}

async function objectiveStringToJSON(imageText: String) {
	const imageTextNoSpace = imageText.split(" ").join("").split("\n").join("");

	// ---------------  seperate numbers from letters --------------------
	const questionNumbers = imageTextNoSpace
		.split("")
		.filter((itm) => !Number.isNaN(parseInt(itm)))
		.map((itm) => parseInt(itm));

	// REARRANGE  NUMBERS TO NATUAL SEQUENCE

	let past9 = false;
	let past99 = false;
	let firstDigit = 0;
	let digitsCount = 0;
	let threeDigStr = "";

	let arrangedNum: any = [];

	questionNumbers.forEach((itm, indx) => {
		if (past9 && !past99) {
			if (indx % 2 != 0) {
				firstDigit = itm;
			} else {
				const twDigNum = parseInt(`${firstDigit}${itm}`);
				if (twDigNum == 99) {
					past99 = true;
				}
				arrangedNum = [...arrangedNum, twDigNum];
			}
		} else if (past99) {
			if (digitsCount == 3) {
				arrangedNum = [...arrangedNum, parseInt(threeDigStr)];
				digitsCount = 0;
				threeDigStr = "";
			} else {
				digitsCount++;
			}

			threeDigStr += itm;
		} else {
			arrangedNum = [...arrangedNum, itm];
		}

		if (itm == 9 && !past9 && !past99) {
			past9 = true;
		}
	});

	// --------------------------- seperate letters ----------------------
	const ObjTextLetter = imageTextNoSpace
		.split("")
		.filter((itm) => Number.isNaN(parseInt(itm)));

	const numberToLetter: any = {};

	arrangedNum.forEach((itm: number, indx: number) => {
		numberToLetter[itm] = ObjTextLetter[indx];
	});

	return numberToLetter;
}

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
	"/",
	upload.fields([
		{ name: "objective_answers", maxCount: 1 },
		{ name: "theory_answers", maxCount: 20 },
	]),
	async (req: Request, res: Response) => {
		const {
			school_id,
			course_name,
			course_code,
			date,
			student_name,
			student_id,
		} = req.body;

		const files = req.files as RequestFiles;

		if (
			!school_id ||
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

			const objectiveJSON = await objectiveStringToJSON(results);

			const theoryTextPromises = files.theory_answers.map((file) =>
				preprocessImageAndExtractText(file.buffer),
			);

			const exam = await ExaminationData.findOne({
				school_id,
				course_name,
				course_code,
				date,
			});

			if (exam) {
				await ExaminationData.updateOne(
					{
						school_id,
						course_name,
						course_code,
						date,
					},
					{
						school_id,
						course_name,
						course_code,
						date,
						grading_status: "in-progress",
						candidates: [
							...exam.candidates,
							{
								student_name,
								student_id,
								objective_answers: objectiveJSON,
								theory_answers: await Promise.all(theoryTextPromises),
							},
						],
					},
				);
				res.status(201).send("Answers saved successfully");
			} else {
				const examAnswer = new ExaminationData({
					school_id,
					course_name,
					course_code,
					date,
					grading_status: "in-progress",
					candidates: [
						{
							student_name,
							student_id,
							objective_answers: objectiveJSON,
							theory_answers: await Promise.all(theoryTextPromises),
						},
					],
				});

				await examAnswer.save();
				res.status(201).send("Answers saved successfully");
			}
		} catch (error) {
			console.error(error);
			res.status(500).send("Error saving e");
		}
	},
);
export default router;
