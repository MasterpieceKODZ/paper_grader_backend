import { Router } from "express";
import OpenAI from "openai";

const router = Router();

router.post("/", async (req, res) => {
	const message = req.body;
	console.log(
		"----------------------------- paper grade requested ----------------",
	);

	const openai = new OpenAI({ apiKey: `${process.env.OPEN_AI_KEY}` });
	const completion = await openai.chat.completions.create({
		messages: [{ ...message }],
		model: "gpt-4o-mini",
		temperature: 0.5,
	});

	console.log("---------------------- GPT-4o-mini ----------------");

	console.log(completion.choices[0].message.content);

	console.log("-----------------------------------------------------");
});

export default router;
