// types/next-auth.d.ts
import { type DefaultSession } from "next-auth"
import { type DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      role?: string | null
    }
  }

  interface User {
    role?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: string | null
  }
}
