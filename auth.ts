// auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8h
  },
  providers: [
    Credentials({
      name: "Login",
      credentials: {
        username: { label: "Benutzername", type: "text" },
        password: { label: "Passwort", type: "password" },
      },
      async authorize(c) {
        const username = String(c?.username ?? "").trim()
        const password = String(c?.password ?? "")
        if (!username || !password) return null

        const user = await prisma.user.findUnique({ where: { username } })
        if (!user) return null

        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) return null

        return {
          id: String(user.id),
          name: user.username,
          role: user.role ?? null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role ?? null
      }
      return token
    },
    async session({ session, token }) {
      session.user.role = token.role ?? null
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
})
