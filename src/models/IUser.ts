export interface IUser {
  id: number
  username: string
  email: string
  avatar?: string
  role: string
  level: number
  experience: number
  authProvider: string
  createdAt?: string
  updatedAt?: string
}
