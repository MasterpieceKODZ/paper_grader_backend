interface Candidate {
	student_name: string;
	student_id: string;
	objective_answers: {};
	objective_score: number;
	theory_answers: string;
	theory_grade_summary: [];
	theory_score: number;
}

export default Candidate;
