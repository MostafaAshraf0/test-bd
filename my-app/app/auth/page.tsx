"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/Context/AuthContext"
import { createClient } from "@/lib/supabase/client"

export default function AuthPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!authLoading && user) router.replace("/")
  }, [authLoading, router, user])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    setSubmitting(true)
    const supabase = createClient()
    const result = mode === "sign-in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (result.error) setMessage(result.error.message)
    else if (mode === "sign-up" && !result.data.session) {
      setMessage("Check your email to confirm your account, then sign in.")
    } else router.replace("/")
    setSubmitting(false)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12">
      <section className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">Welcome</p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            {mode === "sign-in" ? "Sign in to your account" : "Create your account"}
          </h1>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          {message && <p className="text-sm text-red-600" role="alert">{message}</p>}
          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Sign up"}
          </Button>
        </form>
        <button
          className="mt-6 w-full text-center text-sm text-zinc-600 underline-offset-4 hover:text-zinc-950 hover:underline"
          type="button"
          onClick={() => { setMode(mode === "sign-in" ? "sign-up" : "sign-in"); setMessage("") }}
        >
          {mode === "sign-in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </section>
    </main>
  )
}