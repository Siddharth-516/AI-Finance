// Purpose: lightweight auth state for Google + demo sign-in.

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { clearAuth, getCurrentUser, loginGoogle, startGuestSession } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fallbackStatus, setFallbackStatus] = useState('')

  useEffect(() => {
    let alive = true

    const bootstrap = async () => {
      try {
        const me = await getCurrentUser()
        if (alive) {
          setUser(me)
          setFallbackStatus(me?.fallback ? 'Offline cache mode (connection uncertain)' : '')
        }
      } catch {
        clearAuth()
        if (alive) setUser(null)
      } finally {
        if (alive) setLoading(false)
      }
    }

    bootstrap()

    const handleFocus = async () => {
      if (!alive) return
      const me = await getCurrentUser()
      if (alive) {
        setUser(me)
        setFallbackStatus(me?.fallback ? 'Offline cache mode (connection uncertain)' : '')
      }
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      alive = false
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const loginWithGoogle = async (payload) => {
    setFallbackStatus('')
    const response = await loginGoogle(payload)
    if (response?.user) {
      setUser(response.user)
      setFallbackStatus(response.user?.fallback ? 'Offline cache mode (connection uncertain)' : '')
    } else {
      const me = await getCurrentUser()
      setUser(me)
      setFallbackStatus(me?.fallback ? 'Offline cache mode (connection uncertain)' : '')
    }
    return response
  }

  const loginAsGuest = async (remember = true) => {
    setFallbackStatus('Guest mode (session-only, no backend)')
    const guestUser = await startGuestSession(remember)
    setUser(guestUser)
    return { user: guestUser, auth_mode: 'guest' }
  }

  const logout = async () => {
    clearAuth()
    setUser(null)
    setFallbackStatus('')
    window.location.replace('/login')
  }

  const updateUser = (nextUser) => {
    setUser(nextUser)
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      fallbackStatus,
      isAuthed: Boolean(user?.mode === 'user'),
      isGuest: Boolean(user?.mode === 'guest'),
      loginWithGoogle,
      loginAsGuest,
      logout,
      updateUser,
    }),
    [user, loading, fallbackStatus]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
