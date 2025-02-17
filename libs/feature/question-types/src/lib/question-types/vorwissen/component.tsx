import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import { TextArea } from "@self-learning/ui/forms";
import { MDXRemote } from "next-mdx-remote";
import { useEffect, useState } from "react";
import { useQuestion } from "../../use-question-hook";
import { MultipleChoiceOption } from "../multiple-choice/component";

export function VorwissenAnswer() {
	const { question, markdown, setAnswer, answer, evaluation } = useQuestion("vorwissen");

	const [vorwissen, setVorwissen] = useState("");
	const [explanation, setExplanation] = useState("");
	const [doesNotKnow, setDoesNotKnow] = useState(false);
	const [selectedAnswers, setSelectedAnswers] = useState<
		typeof answer["value"]["selectedAnswers"]
	>({});

	useEffect(() => {
		setAnswer({
			type: "vorwissen",
			value: {
				vorwissen,
				explanation: {
					content: explanation,
					doesNotKnow
				},
				selectedAnswers
			}
		});
	}, [setAnswer, vorwissen, explanation, doesNotKnow, selectedAnswers]);

	const [step, setStep] = useState(0);

	return (
		<div className="flex flex-col pb-24">
			{step === 0 && (
				<>
					<div className="font-semibold text-secondary">Vorwissenaktivieriung:</div>
					<p className="mt-2 mb-8 text-light">
						Bevor wir die Antwortalternativen zeigen, versuchen Sie sich daran zu
						erinner was Sie gelernt haben und notieren Sie kurz das Wissen, von dem Sie
						meinen, dass Sie benötigen um die Aufgabe zu lösen.
					</p>

					<TextArea
						label="Vorwissen"
						rows={8}
						value={vorwissen}
						onChange={event => setVorwissen(event.target.value)}
					/>

					<button
						className="btn-primary mt-8 w-fit self-end"
						onClick={() => setStep(s => s + 1)}
					>
						<span>Weiter</span>
						<ChevronRightIcon className="h-5 text-white" />
					</button>
				</>
			)}

			{step === 1 && (
				<>
					<div className="font-semibold text-secondary">Antwortmöglichkeit:</div>
					<p className="mt-2 mb-4 text-light">
						Bitte schreiben Sie auf, wieso Sie meinen, dass diese Antwort richtig bzw.
						falsch ist.
					</p>

					<div className="prose mb-8 max-w-full rounded-lg border border-light-border bg-white p-4">
						{markdown.answersMd[question.requireExplanationForAnswerIds] ? (
							<MDXRemote
								{...markdown.answersMd[question.requireExplanationForAnswerIds]}
							/>
						) : (
							<span className="text-sm text-red-500">
								Error: No markdown found for answer{" "}
								{question.requireExplanationForAnswerIds}
							</span>
						)}
					</div>

					<TextArea
						label="Begründung"
						rows={8}
						value={explanation}
						onChange={event => setExplanation(event.target.value)}
					/>

					<label className="mt-4 flex items-center gap-2">
						<input
							type="checkbox"
							className="rounded text-secondary"
							checked={answer.value.explanation.doesNotKnow}
							onChange={() => setDoesNotKnow(prev => !prev)}
						/>
						Ich weiß es noch nicht.
					</label>

					<div className="flex justify-between gap-4">
						<button
							className="btn-stroked mt-8 flex w-fit items-center self-end"
							onClick={() => setStep(s => s - 1)}
						>
							<ChevronLeftIcon className="h-5 text-light" />
							<span>Zurück</span>
						</button>
						<button
							className="btn-primary mt-8 flex w-fit items-center self-end"
							onClick={() => setStep(s => s + 1)}
						>
							<span>Weiter</span>
							<ChevronRightIcon className="h-5 text-white" />
						</button>
					</div>
				</>
			)}

			{step === 2 && (
				<>
					<div className="flex flex-col gap-4">
						{question.answers.map(option => (
							<MultipleChoiceOption
								key={option.answerId}
								isCorrect={option.isCorrect}
								isUserAnswerCorrect={true} // TODO
								showResult={!!evaluation}
								isSelected={answer.value.selectedAnswers[option.answerId] === true}
								onToggle={() =>
									setSelectedAnswers(old => ({
										...old,
										[option.answerId]:
											old[option.answerId] === true ? false : true
									}))
								}
							>
								{markdown.answersMd[option.answerId] ? (
									<MDXRemote {...markdown.answersMd[option.answerId]} />
								) : (
									<span className="text-red-500">
										Error: No markdown content found.
									</span>
								)}
							</MultipleChoiceOption>
						))}
					</div>

					<button
						className="btn-stroked mt-16 flex w-fit items-center"
						onClick={() => setStep(s => s - 1)}
					>
						<ChevronLeftIcon className="h-5 text-light" />
						<span>Zurück</span>
					</button>
				</>
			)}
		</div>
	);
}
