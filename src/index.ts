// src/index.ts
import connectDB from "./db";
import express, { Application } from "express";
import cors from "cors";
import uploadRoute from "./routes/upload";
import resultsRoute from "./routes/results";

const app: Application = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

app.use("/upload", uploadRoute);
app.use("/results", resultsRoute);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
