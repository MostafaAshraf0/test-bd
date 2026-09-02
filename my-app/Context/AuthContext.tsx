"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { Session, User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

type AuthContextValue = {
	user: User | null
	loading: boolean
	signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const supabase = createClient()
		let mounted = true

		supabase.auth.getSession().then(({ data: { session } }) => {
			if (mounted) {
				setUser(session?.user ?? null)
				setLoading(false)
			}
		})

		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			(_event, session: Session | null) => {
				setUser(session?.user ?? null)
				setLoading(false)
			}
		)

		return () => {
			mounted = false
			subscription.unsubscribe()
		}
	}, [])

	async function signOut() {
		const supabase = createClient()
		await supabase.auth.signOut()
		setUser(null)
	}

	return (
		<AuthContext.Provider value={{ user, loading, signOut }}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (!context) throw new Error("useAuth must be used inside an AuthProvider")
	return context
}
