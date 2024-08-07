import { Schema, model } from "mongoose";

const rubricSchema = new Schema({
	full_mark: String,
	half_mark: String,
	no_mark: String,
});

const theoryQuestionSchema = new Schema({
	question: String,
	rubric: rubricSchema,
});

const courseSchema = new Schema({
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
