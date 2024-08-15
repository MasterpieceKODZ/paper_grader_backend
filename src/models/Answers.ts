// src/models/examinationAnswers.ts
import mongoose, { Document, Schema } from "mongoose";

interface ExaminationAnswer extends Document {
	school_name: string;
	course_name: string;
	course_code: string;
	date: Date;
	grading_status: "in-progress" | "done" | "none";
	answers: {
		student_name: string;
		student_id: string;
		objective_answers: {};
		objective_mark: number;
		theory_answers: [];
		theory_grade_summary: [];
		theory_grade_mark: number;
	}[];
}

const ExaminationAnswerSchema: Schema = new Schema({
	school_name: { type: String, required: true },
	course_name: { type: String, required: true },
	course_code: { type: String, required: true },
	date: { type: Date, required: true },
	grading_status: { type: String, required: false },
	answers: [
		{
			student_name: { type: String, required: true },
			student_id: { type: String, required: true },
			objective_answers: { type: Map, of: String, required: true },
			objective_mark: { type: Number, required: false },
			theory_answers: { type: [], required: true },
			theory_grade_summary: { type: [], required: false },
			theory_grade_mark: { type: Number, required: false },
		},
	],
});

export default mongoose.model<ExaminationAnswer>(
	"ExaminationAnswer",
	ExaminationAnswerSchema,
);
