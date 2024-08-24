import mongoose, { Document, Schema } from "mongoose";

interface ExaminationData extends Document {
	school_id: string;
	course_name: string;
	course_code: string;
	date: Date;
	grading_status: "in-progress" | "done" | "none";
	candidates: {
		student_name: string;
		student_id: string;
		objective_answers: {};
		objective_score: number;
		theory_answers: string;
		theory_grade_summary: [];
		theory_score: number;
	}[];
}

const ExaminationDataSchema: Schema = new Schema(
	{
		school_id: { type: String, required: true },
		course_name: { type: String, required: true },
		course_code: { type: String, required: true },
		date: { type: Date, required: true },
		grading_status: { type: String, required: false },
		candidates: [
			{
				student_name: { type: String, required: true },
				student_id: { type: String, required: true },
				objective_answers: { type: Map, of: String, required: true },
				objective_score: { type: Number, required: false },
				theory_answers: { type: String, required: true },
				theory_grade_summary: { type: [], required: false },
				theory_score: { type: Number, required: false },
			},
		],
	},
	{ collection: "examination" },
);

export default mongoose.model<ExaminationData>(
	"ExaminationData",
	ExaminationDataSchema,
);
