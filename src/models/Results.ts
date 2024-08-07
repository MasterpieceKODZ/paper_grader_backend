// src/models/Result.ts
import mongoose, { Schema, Document } from "mongoose";

interface IResult extends Document {
	studentName: string;
	studentId: string;
	objectiveScore: number;
	theoryScore: number;
	totalScore: number;
	feedback: string;
	subject: string;
	courseCode: string;
	date: string;
}

const ResultSchema: Schema = new Schema({
	studentName: { type: String, required: true },
	studentId: { type: String, required: true },
	objectiveScore: { type: Number, required: true },
	theoryScore: { type: Number, required: true },
	totalScore: { type: Number, required: true },
	feedback: { type: String, required: true },
	subject: { type: String, required: true },
	courseCode: { type: String, required: true },
	date: { type: String, required: true },
});

export default mongoose.model<IResult>("Result", ResultSchema);
