import mongoose, { Document, Schema } from "mongoose";

interface School extends Document {
	school_name: string;
}

const SchoolSchema: Schema = new Schema({
	school_name: { type: String, required: true },
});

export default mongoose.model<School>("Schools", SchoolSchema);
