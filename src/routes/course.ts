import { Router } from "express";
import { Course } from "../models/Course";
import Examination from "../models/Examination";

const courseRouter = Router();

// Add a new course
courseRouter.post("/", async (req, res) => {
	try {
		const course = new Course(req.body);
		await course.save();
		res.sendStatus(201);
	} catch (err: any) {
		res.status(400).send(err.message);
	}
});

// fetch course exams
courseRouter.post("/exams", async (req, res) => {
	const { school_id, course_code } = req.body;

	if (!school_id || !course_code) {
		return res.sendStatus(400);
	}

	try {
		const exams = await Examination.find({ school_id, course_code });
		const examsShort = exams.map((item) => ({
			course_name: item.course_name,
			course_code: item.course_code,
			date: item.date,
		}));

		res.json(examsShort);
	} catch (err: any) {
		res.status(400).send(err.message);
	}
});

// Get all courses for a school
courseRouter.post("/get-all-by-school", async (req, res) => {
	const { school_id } = req.body;

	if (!school_id) {
		return res.sendStatus(400);
	}

	try {
		const courses = await Course.find({ school_id });
		res.json(courses);
	} catch (err: any) {
		res.status(500).send(err.message);
	}
});

// Get all courses by id
courseRouter.post("/get-by-id", async (req, res) => {
	const { school_id, course_id } = req.body;

	if (!school_id || !course_id) {
		return res.sendStatus(400);
	}

	try {
		const course = await Course.findById(course_id);

		res.json(course);
	} catch (err: any) {
		res.status(500).send(err.message);
	}
});

// Update an existing course
courseRouter.post("/update/:id", async (req, res) => {
	console.log("course update request...");
	console.log(req.body);

	try {
		const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!course) {
			res.status(404).send("Course not found");
		} else {
			res.sendStatus(200);
		}
	} catch (err: any) {
		res.status(400).send(err.message);
	}
});

// delete course
courseRouter.post("/delete", async (req, res) => {
	const { school_id, course_code, course_id } = req.body;

	if (!school_id || !course_code || !course_id) {
		return res.sendStatus(400);
	}

	try {
		await Examination.deleteMany({ school_id, course_code });
		await Course.deleteOne({ _id: course_id });

		return res.sendStatus(200);
	} catch (err: any) {
		res.status(500).send(err.message);
	}
});

export default courseRouter;
