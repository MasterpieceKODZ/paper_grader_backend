// src/models/examinationAnswers.ts
import mongoose, { Document, Schema } from "mongoose";

interface ExaminationAnswer extends Document {
	course_name: string;
	course_code: string;
	date: Date;
	answers: {
		student_name: string;
		student_id: string;
		objective_answers: {};
		theory_answers: [];
	}[];
}

const ExaminationAnswerSchema: Schema = new Schema({
	course_name: { type: String, required: true },
	course_code: { type: String, required: true },
	date: { type: Date, required: true },
	answers: [
		{
			student_name: { type: String, required: true },
			student_id: { type: String, required: true },
			objective_answers: { type: Map, of: String, required: true },
			theory_answers: { type: [], required: true },
		},
	],
});

export default mongoose.model<ExaminationAnswer>(
	"ExaminationAnswer",
	ExaminationAnswerSchema,
);
