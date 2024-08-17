import { Schema, model } from "mongoose";

const theoryQuestionSchema = new Schema({
	question: String,
	rubric: String,
	context: [String],
	mark: Number,
});

const courseSchema = new Schema({
	school_id: { type: String, required: true },
	name: { type: String, required: true },
	course_code: { type: String, required: true },
	objective_question_and_answer: {
		type: Map,
		of: String,
	},
	theory_question_and_answer: {
		type: Map,
		of: theoryQuestionSchema,
	},
});

export const Course = model("Course", courseSchema);
