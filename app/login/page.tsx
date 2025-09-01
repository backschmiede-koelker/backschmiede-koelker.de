"use client"
import { signIn } from "next-auth/react"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        className="w-full max-w-sm space-y-3"
        onSubmit={async (e) => {
          e.preventDefault()
          await signIn("credentials", { email, password, callbackUrl: "/admin" })
        }}
      >
        <h1 className="text-2xl font-semibold">Admin Login</h1>
        <input className="border p-2 rounded w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="border p-2 rounded w-full" type="password" placeholder="Passwort" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="bg-black text-white rounded px-4 py-2 w-full" type="submit">Login</button>
      </form>
    </main>
  )
}