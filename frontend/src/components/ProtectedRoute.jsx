import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, allowGuest = true }) {
  let auth;
  try {
    auth = useAuth()
  } catch {
    return <Navigate to='/login' replace />
  }

  const { user, loading } = auth
  const location = useLocation()

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center text-white'>
        <p>Loading session...</p>
      </div>
    )
  }

  const isUser = user?.mode === 'user'
  const isGuest = user?.mode === 'guest'

  if (isUser || (allowGuest && isGuest)) {
    return children
  }

  return <Navigate to='/login' state={{ from: location }} replace />
}
