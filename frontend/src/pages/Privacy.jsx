/** Purpose: privacy center for export and delete actions. */
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header'
import Sidebar from '../components/Layout/Sidebar'
import BottomNav from '../components/Layout/BottomNav'
import { deleteAccount, exportData, getProfile, clearSession } from '../services/api'

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function Privacy() {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [status, setStatus] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getProfile().then(setProfile).catch(() => null)
  }, [])

  const handleExport = async () => {
    setStatus('Exporting data...')
    const data = await exportData()
    downloadJson(`aifc-export-${Date.now()}.json`, data)
    setStatus('Export ready')
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this account and all saved financial data?')) return
    await deleteAccount()
    clearSession()
    navigate('/dashboard', { replace: true })
  }

  const handleLogout = () => {
    clearSession()
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className='min-h-screen bg-bg text-foreground'>
      <div className='flex'>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
        <div className='flex min-h-screen flex-1 flex-col'>
          <Header title='Privacy Center' subtitle='Export your data or permanently delete your account.' profile={profile} onMenuClick={() => setSidebarOpen(true)} />
          <main className='space-y-4 p-4 pb-24 md:p-6'>
            <section className='rounded-3xl border border-border bg-card p-5 shadow-soft'>
              <h2 className='text-2xl font-semibold'>Privacy controls</h2>
              <p className='mt-1 text-sm text-muted'>Everything below is separated from profile and settings on purpose.</p>
              <div className='mt-4 flex flex-wrap gap-3'>
                <button type='button' onClick={handleExport} className='rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white'>Export data</button>
                <button type='button' onClick={handleDelete} className='rounded-xl border border-danger/40 px-5 py-3 text-sm font-semibold text-danger'>Delete account</button>
                <button type='button' onClick={handleLogout} className='rounded-xl border border-border px-5 py-3 text-sm font-semibold'>Logout only</button>
              </div>
              {status ? <p className='mt-3 text-sm text-muted'>{status}</p> : null}
            </section>

            <section className='rounded-3xl border border-border bg-card p-5 shadow-soft'>
              <h3 className='text-xl font-semibold'>What is stored</h3>
              <ul className='mt-3 space-y-2 text-sm text-muted'>
                <li>• Profile details you save on the Profile page.</li>
                <li>• Expenses and transactions tied to your account.</li>
                <li>• SMS imports that you consented to upload.</li>
                <li>• AI insights and chat history while your session is active.</li>
              </ul>
            </section>
          </main>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
