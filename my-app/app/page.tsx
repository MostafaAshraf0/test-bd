"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/Context/AuthContext"

export default function Home() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()

  useEffect(() => {
    if (!loading && !user) router.replace("/auth")
  }, [loading, router, user])

  if (loading || !user) {
    return <main className="flex min-h-screen items-center justify-center">Loading...</main>
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
      <section className="w-full max-w-lg rounded-2xl border bg-white p-8 shadow-sm">
        <p className="mb-2 text-sm font-medium text-zinc-500">Signed in as</p>
        <h1 className="break-words text-2xl font-semibold text-zinc-950">{user.email}</h1>
        <Button className="mt-8 w-full" onClick={signOut}>Sign out</Button>
      </section>
    </main>
  );
}
