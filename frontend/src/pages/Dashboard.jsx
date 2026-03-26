/** Purpose: AI-first dashboard with expenses, insights, recommendations, and chatbot. */
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header'
import Sidebar from '../components/Layout/Sidebar'
import BottomNav from '../components/Layout/BottomNav'
import TxTable from '../components/Transactions/TxTable'
import useFetch from '../hooks/useFetch'
import { addExpense, chatWithCoach, getDashboardSummary, getProfile, setAuthToken } from '../services/api'

export default function Dashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [form, setForm] = useState({ amount: '', category: 'food', date: '', description: '' })
  const [chatInput, setChatInput] = useState('How can I save money this month?')
  const [chatReply, setChatReply] = useState('')
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()

  const { data, loading, error, retry } = useFetch(getDashboardSummary, [])

  useEffect(() => {
    getProfile().then(setProfile).catch(() => {
      setAuthToken(null)
      navigate('/login')
    })
  }, [navigate])

  const expenses = useMemo(() => {
    const list = data?.expenses || []
    if (!query) return list
    return list.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()))
  }, [data, query])

  const insights = data?.insights || []

  const handleAddExpense = async (event) => {
    event.preventDefault()
    await addExpense({ ...form, amount: Number(form.amount) })
    setForm({ amount: '', category: 'food', date: '', description: '' })
    retry()
  }

  const handleChat = async (event) => {
    event.preventDefault()
    const res = await chatWithCoach(chatInput)
    setChatReply(res.reply || '')
  }

  const handleLogout = () => {
    setAuthToken(null)
    navigate('/login')
  }

  return (
    <div className='min-h-screen bg-bg text-foreground'>
      <div className='flex'>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

        <div className='flex min-h-screen flex-1 flex-col'>
          <Header onMenuClick={() => setSidebarOpen(true)} onSearch={setQuery} title='AI Financial Dashboard' />

          <main className='space-y-4 p-4 pb-24 md:p-6' data-testid='dashboard-page'>
            <section className='rounded-2xl border border-border bg-card p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='text-lg font-semibold'>Hello {profile?.name || 'there'} 👋</h2>
                  <p className='text-sm text-muted'>Your data is account scoped and restored every login.</p>
                </div>
                <button type='button' onClick={handleLogout} className='rounded-lg border border-border px-3 py-2 text-sm'>Logout</button>
              </div>
            </section>

            <section className='grid gap-4 lg:grid-cols-2'>
              <form onSubmit={handleAddExpense} className='rounded-2xl border border-border bg-card p-4'>
                <h3 className='text-lg font-semibold'>Add expense</h3>
                <div className='mt-3 grid gap-3'>
                  <input required type='number' placeholder='Amount' value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className='rounded-lg border border-border bg-bg px-3 py-2 text-sm' />
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className='rounded-lg border border-border bg-bg px-3 py-2 text-sm'>
                    <option value='food'>Food</option>
                    <option value='travel'>Travel</option>
                    <option value='rent'>Rent</option>
                    <option value='education'>Education</option>
                    <option value='others'>Others</option>
                  </select>
                  <input required type='date' value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className='rounded-lg border border-border bg-bg px-3 py-2 text-sm' />
                  <input placeholder='Description' value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className='rounded-lg border border-border bg-bg px-3 py-2 text-sm' />
                  <button type='submit' className='rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white'>Save expense</button>
                </div>
              </form>

              <section className='rounded-2xl border border-border bg-card p-4'>
                <h3 className='text-lg font-semibold'>AI insights</h3>
                <ul className='mt-3 space-y-2'>
                  {insights.length ? insights.map((item) => <li key={item} className='rounded-lg bg-bg p-2 text-sm'>{item}</li>) : <li className='text-sm text-muted'>No insights yet.</li>}
                </ul>
              </section>
            </section>

            <section className='rounded-2xl border border-border bg-card p-4'>
              <h3 className='text-lg font-semibold'>AI Coach</h3>
              <form onSubmit={handleChat} className='mt-3 flex gap-2'>
                <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} className='flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm' />
                <button type='submit' className='rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white'>Ask</button>
              </form>
              {chatReply ? <p className='mt-3 whitespace-pre-wrap rounded-lg bg-bg p-3 text-sm'>{chatReply}</p> : null}
            </section>

            {error ? <p className='text-danger'>Failed to load data.</p> : null}
            <TxTable rows={expenses.map((e) => ({ ...e, merchant: e.description, txn_date: e.date }))} loading={loading} />
          </main>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
