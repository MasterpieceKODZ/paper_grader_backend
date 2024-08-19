import convertMapTypeToObjectLiteral from "./convert_map_to_object";

function processGPTResponse(
	completion: any,
	course: any,
	candidateData: any,
	index: number,
) {
	if (completion.choices.length > 0) {
		const gradeResultJson = JSON.parse(
			completion.choices[0].message.content
				.split("")
				.filter(
					(it: string, idx: number, arr: []) => idx > 6 && idx < arr.length - 4,
				)
				.join(""),
		);

		return {
			question: (
				convertMapTypeToObjectLiteral(
					course.theory_question_and_answer as any,
				) as any
			)[`${index + 1}`].question,
			answer: candidateData.theory_answers[index],
			mark: gradeResultJson.markAssigned,
			reason: gradeResultJson.reason,
		};
	}

	return null;
}

export default processGPTResponse;
