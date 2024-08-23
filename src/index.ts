require("dotenv").config();
import connectDB from "./db";
import express, { Application } from "express";
import cors from "cors";
import uploadRouter from "./routes/upload";
import resultsRouter from "./routes/results";
import courseRouter from "./routes/course";
import examAnswerRouter from "./routes/answer";
import gradeExamsRouter from "./routes/grade-exam";
import schoolRouter from "./routes/school";

const app: Application = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

connectDB();

app.use("/upload-answers", uploadRouter);
app.use("/results", resultsRouter);
app.use("/course", courseRouter);
app.use("/exam-answers", examAnswerRouter);
app.use("/grade-exam", gradeExamsRouter);
app.use("/school", schoolRouter);

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
