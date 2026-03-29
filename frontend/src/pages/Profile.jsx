/** Purpose: separate profile management page. */
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header'
import Sidebar from '../components/Layout/Sidebar'
import BottomNav from '../components/Layout/BottomNav'
import { getProfile, updateProfile } from '../services/api'

export default function Profile() {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ name: '', timezone: 'Asia/Kolkata', currency: 'INR', income_range: '0-25000', risk_level: 'low' })
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getProfile().then((user) => {
      setProfile(user)
      setForm({
        name: user.name || '',
        timezone: user.timezone || 'Asia/Kolkata',
        currency: user.currency || 'INR',
        income_range: user.income_range || '0-25000',
        risk_level: user.risk_level || 'low',
      })
    }).catch(() => {
      setProfile({ name: 'Guest', mode: 'guest' })
    })
  }, [])

  const save = async (event) => {
    event.preventDefault()
    const updated = await updateProfile(form)
    setProfile(updated)
    setMessage('Profile saved')
  }

  return (
    <div className='min-h-screen bg-bg text-foreground'>
      <div className='flex'>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
        <div className='flex min-h-screen flex-1 flex-col'>
          <Header title='Profile' subtitle='Manage your identity and account details.' profile={profile} onMenuClick={() => setSidebarOpen(true)} />
          <main className='space-y-4 p-4 pb-24 md:p-6'>
            <section className='rounded-3xl border border-border bg-card p-5 shadow-soft'>
              <h2 className='text-2xl font-semibold'>Current account</h2>
              <p className='mt-1 text-sm text-muted'>This is separate from settings and privacy, like a proper product.</p>
              <div className='mt-4 grid gap-4 md:grid-cols-2'>
                <div className='rounded-2xl border border-border bg-bg p-4'>
                  <p className='text-xs uppercase tracking-[0.2em] text-muted'>Name</p>
                  <p className='mt-2 text-base font-semibold'>{profile?.name || '—'}</p>
                </div>
                <div className='rounded-2xl border border-border bg-bg p-4'>
                  <p className='text-xs uppercase tracking-[0.2em] text-muted'>Email</p>
                  <p className='mt-2 text-base font-semibold'>{profile?.email || '—'}</p>
                </div>
                <div className='rounded-2xl border border-border bg-bg p-4'>
                  <p className='text-xs uppercase tracking-[0.2em] text-muted'>Currency</p>
                  <p className='mt-2 text-base font-semibold'>{profile?.currency || 'INR'}</p>
                </div>
                <div className='rounded-2xl border border-border bg-bg p-4'>
                  <p className='text-xs uppercase tracking-[0.2em] text-muted'>Income range</p>
                  <p className='mt-2 text-base font-semibold'>{profile?.income_range || '—'}</p>
                </div>
              </div>
            </section>

            <section className='rounded-3xl border border-border bg-card p-5 shadow-soft'>
              <h2 className='text-2xl font-semibold'>Edit profile</h2>
              <form onSubmit={save} className='mt-4 grid gap-3 md:grid-cols-2'>
                <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className='rounded-2xl border border-border bg-bg px-4 py-3 text-sm' placeholder='Name' />
                <input value={form.timezone} onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))} className='rounded-2xl border border-border bg-bg px-4 py-3 text-sm' placeholder='Timezone' />
                <input value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} className='rounded-2xl border border-border bg-bg px-4 py-3 text-sm' placeholder='Currency' />
                <input value={form.income_range} onChange={(e) => setForm((p) => ({ ...p, income_range: e.target.value }))} className='rounded-2xl border border-border bg-bg px-4 py-3 text-sm' placeholder='Income range' />
                <select value={form.risk_level} onChange={(e) => setForm((p) => ({ ...p, risk_level: e.target.value }))} className='rounded-2xl border border-border bg-bg px-4 py-3 text-sm md:col-span-2'>
                  <option value='low'>Low risk</option>
                  <option value='medium'>Medium risk</option>
                  <option value='high'>High risk</option>
                </select>
                <div className='flex flex-wrap items-center gap-3 md:col-span-2'>
                  <button type='submit' className='rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white'>Save profile</button>
                  <p className='text-sm text-muted'>Account-scoped data follows this profile.</p>
                </div>
              </form>
              {message ? <p className='mt-3 text-sm text-success'>{message}</p> : null}
            </section>
          </main>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
