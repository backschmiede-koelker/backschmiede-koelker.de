import type { Metadata } from "next"
import LoginForm from "../components/login-form"

export const metadata: Metadata = {
  title: "Admin Login | Backschmiede Kölker",
  description: "Sicherer Zugang zum Adminbereich der Backschmiede Kölker.",
  alternates: { canonical: "/login" },
  openGraph: {
    title: "Admin Login | Backschmiede Kölker",
    description: "Sicherer Zugang zum Adminbereich der Backschmiede Kölker.",
    url: "/login",
    type: "website",
  },
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <LoginForm />
    </main>
  )
}
