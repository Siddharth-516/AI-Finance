import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function LoginRegisterPage() {
  const navigate = useNavigate()
  const { user, loading, loginWithGoogle, loginAsGuest } = useAuth()
  const [authStatus, setAuthStatus] = useState({ loading: false, error: '' })
  const [rememberMe, setRememberMe] = useState(true)
  const hasInitializedGoogle = useRef(false)

  useEffect(() => {
    if (loading) return
    if (user?.email && user.email !== 'guest@example.com') {
      navigate('/dashboard', { replace: true })
    }
  }, [user, loading, navigate])

  const isBusy = authStatus.loading || loading

  useEffect(() => {
    if (hasInitializedGoogle.current) return

    if (!GOOGLE_CLIENT_ID) {
      console.error('VITE_GOOGLE_CLIENT_ID is not set')
      setAuthStatus({ loading: false, error: 'Google Client ID not configured.' })
      return
    }

    const doInitialize = () => {
      if (!window.google?.accounts?.id || hasInitializedGoogle.current) return

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (credentialResponse) => {
          setAuthStatus({ loading: true, error: '' })
          if (!credentialResponse?.credential) {
            setAuthStatus({ loading: false, error: 'Google login failed: no credential returned.' })
            return
          }

          try {
            await loginWithGoogle({ id_token: credentialResponse.credential, remember: rememberMe })
            navigate('/dashboard', { replace: true })
          } catch (error) {
            setAuthStatus({ loading: false, error: error?.message || 'Google login failed' })
          }
        },
      })

      const container = document.getElementById('googleBtn')
      if (container) {
        window.google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          width: '100%',
        })
      }

      hasInitializedGoogle.current = true
    }

    if (window.google?.accounts?.id) {
      doInitialize()
    } else {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = doInitialize
      script.onerror = () => setAuthStatus({ loading: false, error: 'Failed to load Google Identity Services.' })
      document.head.appendChild(script)

      return () => {
        script.onload = null
        script.onerror = null
      }
    }
  }, [loginWithGoogle, rememberMe, navigate])

  const handleGoogleLogin = () => {
    if (!window.google?.accounts?.id) {
      setAuthStatus({ loading: false, error: 'Google Identity Services not loaded.' })
      return
    }

    setAuthStatus({ loading: true, error: '' })
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setAuthStatus({ loading: false, error: 'Google sign-in was not shown. Please try again.' })
      }
    })
  }

  const handleGuestLogin = async () => {
    setAuthStatus({ loading: true, error: '' })
    try {
      await loginAsGuest()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setAuthStatus({ loading: false, error: err?.message || 'Guest login failed.' })
    }
  }

  const features = useMemo(
    () => [
      { title: 'Secure Google Sign-in', body: 'One account per email keeps data isolated and private.' },
      { title: 'Auto-scoped ledger', body: 'Transactions, SMS parse and recommendations are tied to your user profile.' },
      { title: 'Premium dark mode', body: 'Soft gradients, glassmorphism, and subtle animations.' },
    ],
    []
  )

  return (
    <motion.div
      className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
    >
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.3),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.25),transparent_50%)]' />
      <div className='relative mx-auto flex min-h-screen max-w-6xl items-center justify-center p-6'>
        <div className='grid w-full max-w-5xl gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:grid-cols-2'>
          <div className='space-y-5 p-1 md:p-6'>
            <h1 className='text-4xl font-bold tracking-tight'>AI Financial Companion</h1>
            <p className='text-lg text-slate-300'>Turn your spending into smarter decisions.</p>
            <ul className='space-y-3'>
              {features.map((feature) => (
                <li key={feature.title} className='rounded-xl bg-white/5 p-4 text-sm transition hover:bg-white/10'>
                  <h3 className='font-semibold'>{feature.title}</h3>
                  <p className='text-slate-300'>{feature.body}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className='rounded-2xl border border-white/15 bg-slate-900/70 p-6 shadow-soft ring-1 ring-white/10 backdrop-blur-lg'>
            <h2 className='text-2xl font-semibold'>Welcome back</h2>
            <p className='mt-1 text-sm text-slate-300'>Continue with Google or as a temporary guest</p>

            <div className='mt-6 space-y-3'>
              <div id='googleBtn' className='w-full' />

              <motion.button
                type='button'
                onClick={handleGuestLogin}
                disabled={isBusy}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className='w-full rounded-xl border border-slate-600 bg-transparent px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70'
              >
                Continue as Guest
              </motion.button>

              <label className='flex items-center gap-2 text-sm text-slate-200'>
                <input type='checkbox' checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className='h-4 w-4 rounded border-slate-500 bg-slate-900' />
                Remember me on this device
              </label>
            </div>

            {authStatus.error && <p className='mt-3 rounded-lg bg-rose-950/50 px-3 py-2 text-sm text-rose-200'>{authStatus.error}</p>}

            <p className='mt-5 text-xs text-slate-400'>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

