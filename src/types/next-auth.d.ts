import { Role } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      role: Role
    }
  }
  
  interface User {
    role: Role
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string
    role: Role
  }
}
