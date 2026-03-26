/** Purpose: Google OAuth login page for account-scoped data access. */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { googleLogin, setAuthToken } from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('demo@example.com')
  const [name, setName] = useState('Demo User')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleGoogleLogin = async () => {
    setError('')
    try {
      const res = await googleLogin({ email, name })
      setAuthToken(res.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError('Google login failed. Please retry.')
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-bg p-6'>
      <div className='glass-card w-full max-w-md rounded-2xl border border-border p-6'>
        <h1 className='text-2xl font-semibold'>Welcome to AI Financial Companion</h1>
        <p className='mt-2 text-sm text-muted'>Sign in to access your expenses and AI guidance.</p>
        <div className='mt-4 space-y-3'>
          <input className='w-full rounded-lg border border-border bg-card px-3 py-2 text-sm' value={name} onChange={(e) => setName(e.target.value)} placeholder='Name' />
          <input className='w-full rounded-lg border border-border bg-card px-3 py-2 text-sm' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email' />
          <button type='button' onClick={handleGoogleLogin} className='w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white'>
            Continue with Google
          </button>
        </div>
        {error ? <p className='mt-3 text-sm text-danger'>{error}</p> : null}
      </div>
    </div>
  )
}
