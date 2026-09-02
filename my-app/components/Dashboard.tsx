'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/Context/AuthContext'
import { createClient } from '@/lib/supabase/client'

type Participant = {
	id: string
	name: string
	mobile_phone: string
	department: string
	score: number | null
	total_questions: number | null
	completed_at: string | null
}

export default function Dashboard() {
	const router = useRouter()
	const { user, loading } = useAuth()
	const [participants, setParticipants] = useState<Participant[]>([])
	const [loadingResults, setLoadingResults] = useState(true)
	const [error, setError] = useState('')
	const [refreshKey, setRefreshKey] = useState(0)

	useEffect(() => {
		if (loading || !user) return

		async function loadResults() {
			const { data, error: queryError } = await createClient()
				.from('quiz_participants')
				.select('id, name, mobile_phone, department, score, total_questions, completed_at')
				.not('completed_at', 'is', null)
				.not('score', 'is', null)
				.order('completed_at', { ascending: false })

			if (queryError) setError(`Results could not be loaded: ${queryError.message}`)
			else setParticipants(data ?? [])
			setLoadingResults(false)
		}

		loadResults()
	}, [loading, refreshKey, user])

	useEffect(() => {
		if (!loading && !user) router.replace('/auth')
	}, [loading, router, user])

	if (loading || !user) return <main className="flex min-h-screen items-center justify-center">Loading...</main>

	return (
		<main className="min-h-screen bg-zinc-50 px-6 py-12 text-zinc-950">
			<section className="mx-auto w-full max-w-6xl">
				<div className="mb-8">
					<p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Dashboard</p>
					<h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Quiz results</h1>
					<div className="mt-3 flex flex-wrap items-center justify-between gap-4"><p className="text-zinc-600">See the people who have completed the quiz.</p><Button variant="outline" size="sm" onClick={() => { setLoadingResults(true); setError(''); setRefreshKey((key) => key + 1) }}><RefreshCw aria-hidden="true" /> Refresh</Button></div>
				</div>
				<div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
					{loadingResults ? <p className="p-8 text-sm text-zinc-500">Loading results...</p> : error ? <p className="p-8 text-sm text-red-600" role="alert">{error}</p> : participants.length === 0 ? <p className="p-8 text-sm text-zinc-500">No completed quiz results yet.</p> : (
						<div className="overflow-x-auto">
							<table className="w-full min-w-[620px] text-left text-sm">
								<thead className="border-b bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500"><tr><th className="px-6 py-4 font-medium">Name</th><th className="px-6 py-4 font-medium">Mobile phone</th><th className="px-6 py-4 font-medium">Department</th><th className="px-6 py-4 font-medium">Score</th><th className="px-6 py-4 font-medium">Status</th></tr></thead>
								<tbody className="divide-y">{participants.map((participant) => <tr key={participant.id} className="text-zinc-700"><td className="px-6 py-4 font-medium text-zinc-950">{participant.name}</td><td className="px-6 py-4">{participant.mobile_phone}</td><td className="px-6 py-4">{participant.department}</td><td className="px-6 py-4">{participant.score === null ? '-' : `${participant.score} / ${participant.total_questions}`}</td><td className="px-6 py-4">{participant.completed_at ? new Date(participant.completed_at).toLocaleDateString() : 'In progress'}</td></tr>)}</tbody>
							</table>
						</div>
					)}
				</div>
			</section>
		</main>
	)
}
