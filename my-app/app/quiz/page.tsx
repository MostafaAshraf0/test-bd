'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import QuizForm from '@/components/quiz-from'
import { createClient } from '@/lib/supabase/client'
import questionsData from '@/data/questions.json'

type QuizOption = { option_id: string; text: string }
type Question = { question_id: string; question_text: string; options: QuizOption[]; answer: { correct_option_id: string } }
const questions: Question[] = questionsData

export default function QuizPage() {
	const [started, setStarted] = useState(false)
	const [participantId, setParticipantId] = useState<string | null>(null)
	const [currentQuestion, setCurrentQuestion] = useState(0)
	const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>(() => Array(questions.length).fill(null))
	const [finished, setFinished] = useState(false)
	const [savingResult, setSavingResult] = useState(false)
	const [saveError, setSaveError] = useState('')

	const question = questions[currentQuestion]
	const selectedAnswer = selectedAnswers[currentQuestion]
	const score = questions.reduce((total, questionItem, index) => total + (selectedAnswers[index] === questionItem.answer.correct_option_id ? 1 : 0), 0)

	function selectAnswer(answer: string) {
		setSelectedAnswers((answers) => {
			const updatedAnswers = [...answers]
			updatedAnswers[currentQuestion] = answer
			return updatedAnswers
		})
	}

	async function goToNextQuestion() {
		if (currentQuestion === questions.length - 1) {
			if (!participantId) return
			setSavingResult(true)
			setSaveError('')
			const { data: saved, error } = await createClient().rpc('complete_quiz_participant', {
				p_participant_id: participantId,
				p_score: score,
				p_total_questions: questions.length,
			})
			if (error || saved !== true) {
				setSaveError('Your score could not be saved. Please try again.')
				setSavingResult(false)
				return
			}
			setFinished(true)
			setSavingResult(false)
			return
		}
		setCurrentQuestion((questionIndex) => questionIndex + 1)
	}

	function restartQuiz() {
		setStarted(false)
		setParticipantId(null)
		setCurrentQuestion(0)
		setSelectedAnswers(Array(questions.length).fill(null))
		setFinished(false)
		setSaveError('')
	}

	return (
		<main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-950">
			<section className="mx-auto w-full max-w-2xl">
				<div className="mb-8 flex items-end justify-between gap-4"><div><p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Quick quiz</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Test your knowledge</h1></div>{started && !finished && <p className="pb-1 text-sm font-medium text-zinc-500">{currentQuestion + 1} / {questions.length}</p>}</div>
				{!started ? <QuizForm onSubmitted={(id) => { setParticipantId(id); setStarted(true) }} /> : finished ? <div className="rounded-2xl border bg-white p-8 text-center shadow-sm sm:p-12"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Quiz complete</p><h2 className="mt-4 text-5xl font-semibold tracking-tight">{score} / {questions.length}</h2><p className="mt-3 text-zinc-600">You answered {score === 1 ? 'one question' : `${score} questions`} correctly.</p><Button className="mt-8" onClick={restartQuiz}>Try again</Button></div> : (
					<div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-10"><div className="mb-8 h-2 overflow-hidden rounded-full bg-zinc-100" aria-label={`Question ${currentQuestion + 1} of ${questions.length}`}><div className="h-full rounded-full bg-zinc-950 transition-all" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} /></div><h2 className="text-2xl font-semibold leading-tight sm:text-3xl">{question.question_text}</h2><div className="mt-8 grid gap-3">{question.options.map((option, index) => { const isSelected = selectedAnswer === option.option_id; return <button key={option.option_id} type="button" aria-pressed={isSelected} onClick={() => selectAnswer(option.option_id)} className={`flex min-h-14 items-center gap-4 rounded-xl border px-4 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-zinc-400 ${isSelected ? 'border-zinc-950 bg-zinc-950 text-white' : 'border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50'}`}><span className={`flex size-8 shrink-0 items-center justify-center rounded-full border text-xs ${isSelected ? 'border-white/40' : 'border-zinc-300 text-zinc-500'}`}>{String.fromCharCode(65 + index)}</span>{option.text}</button> })}</div>{saveError && <p className="mt-6 text-sm text-red-600" role="alert">{saveError}</p>}<div className="mt-10 flex justify-between gap-3"><Button variant="outline" onClick={() => setCurrentQuestion((index) => index - 1)} disabled={currentQuestion === 0}>Back</Button><Button onClick={goToNextQuestion} disabled={selectedAnswer === null || savingResult}>{savingResult ? 'Saving result...' : currentQuestion === questions.length - 1 ? 'Finish quiz' : 'Next question'}</Button></div></div>
				)}
			</section>
		</main>
	)
}
