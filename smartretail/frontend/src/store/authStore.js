import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:    null,
      token:   null,
      storeId: 1,   // default store

      login: async (credentials) => {
        const res = await authAPI.login(credentials)
        const { token, userId, username, fullName, roles } = res.data.data
        localStorage.setItem('token', token)
        set({ user: { id: userId, username, fullName, roles }, token })
        return roles
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null })
        window.location.href = '/login'
      },

      isAdmin:  () => get().user?.roles?.includes('ROLE_ADMIN'),
      isOwner:  () => get().user?.roles?.includes('ROLE_OWNER') || get().user?.roles?.includes('ROLE_ADMIN'),
      isStaff:  () => get().user?.roles?.includes('ROLE_STAFF'),
    }),
    { name: 'smartretail-auth', partialize: (s) => ({ user: s.user, token: s.token, storeId: s.storeId }) }
  )
)
