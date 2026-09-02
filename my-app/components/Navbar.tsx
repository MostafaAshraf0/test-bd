'use client'

import Link from 'next/link'
import { Brain, House, ListChecks, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/Context/AuthContext'

export function Navbar() {
	const { user, loading, signOut } = useAuth()

	return (
		<header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
			<nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-6" aria-label="Main navigation">
				<Link className="flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-950" href="/">
					<span className="flex size-8 items-center justify-center rounded-lg bg-zinc-950 text-white">
						<Brain className="size-4" aria-hidden="true" />
					</span>
					Quizly
				</Link>

				<div className="flex items-center gap-1 sm:gap-3">
					<Link className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950" href="/">
						<House className="size-4" aria-hidden="true" />
						<span className="hidden sm:inline">Home</span>
					</Link>
					<Link className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950" href="/quiz">
						<ListChecks className="size-4" aria-hidden="true" />
						<span className="hidden sm:inline">Quiz</span>
					</Link>
					{!loading && user ? (
						<Button variant="outline" size="sm" onClick={signOut}>
							<LogOut aria-hidden="true" />
							<span className="hidden sm:inline">Sign out</span>
						</Button>
					) : null}
				</div>
			</nav>
		</header>
	)
}
