import { Router } from "express";
import { Course } from "../models/Course";

const courseRouter = Router();

// Get all courses
courseRouter.get("/", async (req, res) => {
	console.log("courses requested...");

	try {
		const courses = await Course.find();
		res.json(courses);
	} catch (err: any) {
		res.status(500).send(err.message);
	}
});

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

// Update an existing course
courseRouter.put("/:id", async (req, res) => {
	try {
		const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
		});
		if (!course) {
			res.status(404).send("Course not found");
		} else {
			res.json(course);
		}
	} catch (err: any) {
		res.status(400).send(err.message);
	}
});

export default courseRouter;
