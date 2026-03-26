/** Purpose: Google OAuth login page for account-scoped data access. */
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { googleLogin, setAuthToken } from '../services/api'

const allowDevFallback = import.meta.env.VITE_ALLOW_DEV_AUTH_FALLBACK === 'true'

export default function Login() {
  const [email, setEmail] = useState('demo@example.com')
  const [name, setName] = useState('Demo User')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const buttonRef = useRef(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      if (!window.google || !buttonRef.current) return
      if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        setError('Missing VITE_GOOGLE_CLIENT_ID for Google sign-in.')
        return
      }
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            const res = await googleLogin({ id_token: response.credential })
            setAuthToken(res.access_token)
            navigate('/dashboard')
          } catch {
            setError('Google token verification failed.')
          }
        },
      })
      window.google.accounts.id.renderButton(buttonRef.current, { theme: 'outline', size: 'large', width: 280 })
    }
    document.body.appendChild(script)
    return () => script.remove()
  }, [navigate])

  const handleDevLogin = async () => {
    setError('')
    try {
      const res = await googleLogin({ email, name })
      setAuthToken(res.access_token)
      navigate('/dashboard')
    } catch {
      setError('Dev fallback login failed or disabled on backend.')
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-bg p-6'>
      <div className='glass-card w-full max-w-md rounded-2xl border border-border p-6'>
        <h1 className='text-2xl font-semibold'>Welcome to AI Financial Companion</h1>
        <p className='mt-2 text-sm text-muted'>Sign in with Google to restore your saved account data.</p>

        <div className='mt-4 flex justify-center' ref={buttonRef} />

        {allowDevFallback ? (
          <>
            <p className='mt-5 text-xs uppercase text-muted'>Dev fallback (enabled)</p>
            <div className='mt-2 space-y-3'>
              <input className='w-full rounded-lg border border-border bg-card px-3 py-2 text-sm' value={name} onChange={(e) => setName(e.target.value)} placeholder='Name' />
              <input className='w-full rounded-lg border border-border bg-card px-3 py-2 text-sm' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email' />
              <button type='button' onClick={handleDevLogin} className='w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white'>
                Continue (Dev)
              </button>
            </div>
          </>
        ) : null}

        {error ? <p className='mt-3 text-sm text-danger'>{error}</p> : null}
      </div>
    </div>
  )
}
