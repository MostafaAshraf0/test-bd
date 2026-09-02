'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/Context/AuthContext'
import { createClient } from '@/lib/supabase/client'

type QuizFormProps = {
	onSubmitted: (participantId: string) => void
}

export default function QuizForm({ onSubmitted }: QuizFormProps) {
	const { user } = useAuth()
	const [name, setName] = useState('')
	const [mobilePhone, setMobilePhone] = useState('')
	const [department, setDepartment] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setSubmitting(true)
		setError('')

		const supabase = createClient()
		const participantId = crypto.randomUUID()
		const { error: insertError } = await supabase.from('quiz_participants').insert({
			id: participantId,
			user_id: user?.id ?? null,
			name: name.trim(),
			mobile_phone: mobilePhone.trim(),
			department: department.trim(),
		})

		if (insertError) {
			console.error('Could not save quiz participant:', insertError)
			setError(`Could not save your details: ${insertError.message}`)
			setSubmitting(false)
			return
		}

		onSubmitted(participantId)
	}

	return (
		<div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-10">
			<div className="mb-8">
				<p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Before you begin</p>
				<h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Tell us a little about you</h2>
				<p className="mt-3 text-sm leading-6 text-zinc-600">Your details help us keep a record of this quiz attempt.</p>
			</div>
			<form className="space-y-5" onSubmit={handleSubmit}>
				<div className="space-y-2">
					<Label htmlFor="name">Name</Label>
					<Input id="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Alex Johnson" required />
				</div>
				<div className="space-y-2">
					<Label htmlFor="mobile-phone">Mobile phone</Label>
					<Input
						id="mobile-phone"
						type="tel"
						value={mobilePhone}
						onChange={(event) => setMobilePhone(event.target.value)}
						placeholder="e.g. +1 555 123 4567"
						required
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="department">Department</Label>
					<Input
						id="department"
						value={department}
						onChange={(event) => setDepartment(event.target.value)}
						placeholder="e.g. Engineering"
						required
					/>
				</div>
				{error && <p className="text-sm text-red-600" role="alert">{error}</p>}
				<Button className="w-full" type="submit" disabled={submitting}>
					{submitting ? 'Saving details...' : 'Start quiz'}
				</Button>
			</form>
		</div>
	)
}
