/** Purpose: separate settings page for appearance and app preferences. */
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header'
import Sidebar from '../components/Layout/Sidebar'
import BottomNav from '../components/Layout/BottomNav'
import { getProfile } from '../services/api'

export default function Settings() {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [theme, setTheme] = useState(localStorage.getItem('aifc_theme') || 'dark')
  const [compact, setCompact] = useState(localStorage.getItem('aifc_compact') === 'true')
  const [alerts, setAlerts] = useState(localStorage.getItem('aifc_alerts') !== 'false')
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    localStorage.setItem('aifc_theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('aifc_compact', String(compact))
  }, [compact])

  useEffect(() => {
    localStorage.setItem('aifc_alerts', String(alerts))
  }, [alerts])

  useEffect(() => {
    getProfile().then(setProfile).catch(() => null)
  }, [])

  return (
    <div className='min-h-screen bg-bg text-foreground'>
      <div className='flex'>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
        <div className='flex min-h-screen flex-1 flex-col'>
          <Header title='Settings' subtitle='Tune how the app feels and behaves.' profile={profile} onMenuClick={() => setSidebarOpen(true)} />
          <main className='space-y-4 p-4 pb-24 md:p-6'>
            <section className='rounded-3xl border border-border bg-card p-5 shadow-soft'>
              <h2 className='text-2xl font-semibold'>Appearance</h2>
              <p className='mt-1 text-sm text-muted'>Control the visual mode and density. This is separate from profile and privacy.</p>
              <div className='mt-4 grid gap-3 md:grid-cols-3'>
                <button type='button' onClick={() => setTheme('dark')} className={`rounded-2xl border px-4 py-4 text-left ${theme === 'dark' ? 'border-accent bg-accent/15' : 'border-border bg-bg'}`}>
                  <p className='font-semibold'>Dark</p>
                  <p className='mt-1 text-sm text-muted'>Best for late-night budgeting.</p>
                </button>
                <button type='button' onClick={() => setTheme('light')} className={`rounded-2xl border px-4 py-4 text-left ${theme === 'light' ? 'border-accent bg-accent/15' : 'border-border bg-bg'}`}>
                  <p className='font-semibold'>Light</p>
                  <p className='mt-1 text-sm text-muted'>Cleaner for presentations and demos.</p>
                </button>
                <button type='button' onClick={() => setCompact((prev) => !prev)} className={`rounded-2xl border px-4 py-4 text-left ${compact ? 'border-accent bg-accent/15' : 'border-border bg-bg'}`}>
                  <p className='font-semibold'>Compact layout</p>
                  <p className='mt-1 text-sm text-muted'>Tighter spacing for power users.</p>
                </button>
              </div>
            </section>

            <section className='rounded-3xl border border-border bg-card p-5 shadow-soft'>
              <h2 className='text-2xl font-semibold'>Preferences</h2>
              <div className='mt-4 grid gap-3 md:grid-cols-2'>
                <label className='flex items-center justify-between rounded-2xl border border-border bg-bg px-4 py-4'>
                  <span>
                    <span className='block font-semibold'>Spending alerts</span>
                    <span className='text-sm text-muted'>Show nudges when spending spikes.</span>
                  </span>
                  <input type='checkbox' checked={alerts} onChange={(e) => setAlerts(e.target.checked)} />
                </label>
                <button type='button' onClick={() => navigate('/profile')} className='rounded-2xl border border-border bg-bg px-4 py-4 text-left'>
                  <span className='block font-semibold'>Profile</span>
                  <span className='text-sm text-muted'>Edit your account details separately.</span>
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
