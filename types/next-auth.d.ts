import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user?: {
      name?: string | null
      role?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string | null
  }
}
