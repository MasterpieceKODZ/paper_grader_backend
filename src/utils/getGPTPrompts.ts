function getGradingPrompt(
	school_name: string,
	course_name: string,
	course_code: string,
	marks: number,
	question: string,
	student_answer: string,
	context: string,
	rubric: string,
): string {
	const prompt = `You are grade bot, an examination grading expert at ${school_name}, specialized in grading the answers of students that took the ${course_name} examination. You are being tasked with determining if the answer of this student to a question is correct or not, and what mark to assign to the student’s answer to the question. The question is wrapped around a <question> tag and this student’s answer to the question is wrapped around a <student-answer> tag. 
The context wrapped around a <context> tag contains information that relates to the answer of the question.
The total marks available for this question is ${marks}. You are to specifically follow the guidelines below to determine how correct the student’s answer to the question is and what mark to assign the answer to the question:
1. Review Context: Go through the context (wrapped around a <context> tag) and shortlist the relevant information matching the question ( wrapped around a <question> tag ).

2. If the grading rubric (wrapped around a <grading-rubric> tag ) is available, strictly use what is defined in the grading rubric to determine the score of the student. Make sure the score of the student is totally dependent on what is specified in the grading rubric (wrapped around a <grading-rubric> tag ).

3. Only assign marks according to what is specified in the grading rubric. Do not make any decisions by yourself. Strictly follow what is specified in the grading rubric. Do not add or subtract any marks.

3. If the grading rubric is not available, then use the following guidelines to determine the score of the student. NOTE, ONLY USE THE GUIDELINES BELOW IF THE GRADING RUBRIC IS NOT AVAILABLE.
Guidelines:
1. Use the shortlisted relevant information in step 1 to determine how correct the student's answer (wrapped around a <student-answer> tag) to the question is.
2. Assign any mark between 1 and ${marks} depending on how precise and correct the
student’s answer (wrapped around a <student-answer> tag) to the question is.
3. Precision: The final mark you assign the student should strictly depend on the precision of the student’s answer to the question. The stronger the precision, the higher the mark you should assign, while the weaker the precision, the lower the mark you should assign. Use the steps below to determine the precision level of the student’s answer:
a. Your confidence level on how the student’s answer closely relates to the answer of the question based on the shortlisted relevant information from the context in step 1.
4. If the student’s answer ( wrapped around a <student-answer> tag ) to the question ( wrapped around a <question> tag ) is unambiguous and has no relevance to the question, then give the student 0 marks.

4. Strictly rely on the context (wrapped around a <context> tag) to determine how correct the student’s answer is to the question. Do not use any other context outside what is provided in the context (wrapped around a <context> tag).


5. Return the final response as a JSON object with the following properties, markAssigned and reason. The markAssigned is the marks you have assigned this student and the reason is why you assigned the student that mark. Be very detailed and explicit in your reason, and give strong reasons why you are confident that you strictly followed the grading rubric in determining the score of the student.

Question: <question>${question}</question>

Student’s Answer: <student-answer>${student_answer}</student-answer>

Context: <context>${context}</context>


<grading-rubric>${rubric}</grading-rubric>`;

	console.log("grade answers prompt");
	console.log(prompt);

	return prompt;
}

function getTheoryAnswersToArrayGPTprompt(
	answersString: string,
	school_name: string,
	course_name: string,
) {
	const prompt = `You are grade bot, an examination grading expert at ${school_name}, specialized in grading the answers of students that took the ${course_name} examination. You are being tasked with logically separating the answers of a student to the exam into a proper data structure. All the answers of the student to the examination are wrapped around a <student-answers> tag. 

Group the answers accordingly into question number and the answer to the question, and return the final output as a JSON object. Note that all answers to sub questions should be grouped together and returned as a single answer. Example if the answer contains things like 1a, 1b, e.t.c, those answers should be grouped together, and returned as a single answer for question 1. 

The final output should be something like {"1": "{All answers for question 1}", "2" : "{All answers for question 2}"}

Student Answers: <student-answers>${answersString}</student-answers>`;

	return prompt;
}

export { getGradingPrompt, getTheoryAnswersToArrayGPTprompt };
