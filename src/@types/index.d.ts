import { UserRole } from '../enums/user-role.enum'

declare global {
  namespace Express {
    interface User {
      id: string
      name: string
      email: string
      role: UserRole
    }
  }
}

export {}
