import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  _id: string
  email: string
  nickname: string
  role: string
  avatar?: string
  company?: string
  bio?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isExpert: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isExpert: false,
      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          isAdmin: user.role === 'admin',
          isExpert: user.role === 'expert' || user.role === 'admin',
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
          isExpert: false,
        }),
      updateUser: (user) =>
        set({
          user,
          isAdmin: user.role === 'admin',
          isExpert: user.role === 'expert' || user.role === 'admin',
        }),
    }),
    { name: 'qf-auth' }
  )
)
