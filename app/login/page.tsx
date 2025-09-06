// /app/login/page.tsx
"use client"
import { signIn } from "next-auth/react"
import { useState } from "react"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        className="w-full max-w-sm space-y-4 rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5 backdrop-blur p-5 shadow-sm"
        onSubmit={async (e) => {
          e.preventDefault()
          setLoading(true); setErr(null)
          const res = await signIn("credentials", {
            redirect: false,
            username,
            password,
            callbackUrl: "/admin",
          })
          setLoading(false)
          if (res?.error) { setErr("Ungültige Anmeldedaten."); return }
          window.location.href = "/admin"
        }}
      >
        <h1 className="text-2xl font-semibold">Admin Login</h1>
        <input
          className="border p-2 rounded w-full bg-white dark:bg-zinc-800"
          placeholder="Benutzername"
          value={username}
          onChange={e=>setUsername(e.target.value)}
        />
        <input
          className="border p-2 rounded w-full bg-white dark:bg-zinc-800"
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={e=>setPassword(e.target.value)}
        />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-4 py-2 w-full disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? "Anmelden…" : "Anmelden"}
        </button>
      </form>
    </main>
  )
}
