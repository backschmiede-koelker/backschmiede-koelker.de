import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { 
    strategy: "jwt",
    maxAge: 60 * 60 * 8
  },
  providers: [
    Credentials({
      name: "Email & Passwort",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(c) {
        const email = String(c?.email ?? "").trim()
        const password = String(c?.password ?? "")

        if (!email || !password) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null

        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) return null

        return { id: user.id, email: user.email, name: user.email, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role
      return token
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
})
