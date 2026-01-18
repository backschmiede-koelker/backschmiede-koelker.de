// auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { getPrisma } from "@/lib/prisma"
import {
  isLoginLocked,
  normalizeLoginKey,
  recordLoginFailure,
  resetLoginFailures,
} from "@/lib/auth-rate-limit"
import bcrypt from "bcryptjs"

const DUMMY_HASH =
  "$2a$10$CwTycUXWue0Thq9StjUM0uJ8Cev.0DIsxP1hP8B7F6KfG6Ki1Gd5K"

async function safeIsLoginLocked(usernameKey: string) {
  try {
    return await isLoginLocked(usernameKey)
  } catch {
    return false
  }
}

async function safeRecordLoginFailure(usernameKey: string) {
  try { await recordLoginFailure(usernameKey) }
  catch (e) { if (process.env.NODE_ENV !== "production") console.error("[auth-rate-limit] record fail", e) }
}

async function safeResetLoginFailures(usernameKey: string) {
  try {
    await resetLoginFailures(usernameKey)
  } catch {}
}

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
        const usernameKey = normalizeLoginKey(username)

        if (username) {
          const locked = await safeIsLoginLocked(usernameKey)
          if (locked) return null
        }

        if (!username || !password) {
          if (username) await safeRecordLoginFailure(usernameKey)
          return null
        }

        const user = await getPrisma().user.findUnique({ where: { username } })
        if (!user) {
          await bcrypt.compare(password, DUMMY_HASH)
          await safeRecordLoginFailure(usernameKey)
          return null
        }

        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) {
          await safeRecordLoginFailure(usernameKey)
          return null
        }

        await safeResetLoginFailures(usernameKey)

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
  secret: process.env.AUTH_SECRET,
})
