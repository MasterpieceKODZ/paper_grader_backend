import { Router } from "express";
import School from "../models/School";

const schoolRouter = Router();

// Get school by id
schoolRouter.post("/get-by-id", async (req, res) => {
	const { _id } = req.body;
	try {
		const school = await School.findOne({ _id });

		res.json(school);
	} catch (err: any) {
		res.status(500).send(err.message);
	}
});

// Get all schools
schoolRouter.get("/get-all", async (req, res) => {
	try {
		const schools = await School.find();

		res.json(schools);
	} catch (err: any) {
		res.status(500).send(err.message);
	}
});

// add a school
schoolRouter.post("/add-new", async (req, res) => {
	try {
		await School.create({ school_name: req.body.schoolName });

		res.send("success");
	} catch (err: any) {
		console.log(err);

		res.status(500).send(err.message);
	}
});

export default schoolRouter;
