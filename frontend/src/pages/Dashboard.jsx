/** Purpose: AI-first dashboard with expenses, insights, recommendations, and chatbot. */
import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Layout/Header'
import Sidebar from '../components/Layout/Sidebar'
import BottomNav from '../components/Layout/BottomNav'
import TxTable from '../components/Transactions/TxTable'
import MetricCard from '../components/Cards/MetricCard'
import InsightCard from '../components/Cards/InsightCard'
import GoalCard from '../components/Cards/GoalCard'
import NudgePanel from '../components/Widgets/NudgePanel'
import MonthlyTrendChart from '../components/Charts/MonthlyTrendChart'
import SpendingBarChart from '../components/Charts/SpendingBarChart'
import useFetch from '../hooks/useFetch'
import { addExpense, chatWithCoach, deleteExpense, getDashboardSummary, getProfile, getRecommendations } from '../services/api'

const today = () => new Date().toISOString().slice(0, 10)
const goalKeyFor = (email) => `aifc_goal_${email || 'guest'}`

function groupByCategory(expenses = []) {
  const totals = new Map()
  expenses.forEach((expense) => {
    const category = expense.category || 'others'
    totals.set(category, (totals.get(category) || 0) + Number(expense.amount || 0))
  })
  return [...totals.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
}

function groupByMonth(expenses = []) {
  const totals = new Map()
  expenses.forEach((expense) => {
    const key = String(expense.date || expense.txn_date || '').slice(0, 7)
    totals.set(key, (totals.get(key) || 0) + Number(expense.amount || 0))
  })
  return [...totals.entries()]
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

export default function Dashboard() {
  const { loading: authLoading, fallbackStatus } = useAuth()
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [form, setForm] = useState({ amount: '', category: 'food_dining', date: today(), description: '' })
  const [chatInput, setChatInput] = useState('How can I save money this month?')
  const [chatReply, setChatReply] = useState('')
  const [autoInsight, setAutoInsight] = useState('')
  const [profile, setProfile] = useState(null)
  const [profileError, setProfileError] = useState('')
  const [goal, setGoal] = useState({ title: 'Emergency Fund Goal', current: 42000, target: 100000 })
  const [recommendations, setRecommendations] = useState(null)
  const navigate = useNavigate()

  const { data, loading, error, retry } = useFetch(getDashboardSummary, [])

  if (authLoading) {
    return (
      <div className='flex h-screen items-center justify-center text-white'>
        <div>Loading session and profile...</div>
      </div>
    )
  }

  useEffect(() => {
    getProfile().then((user) => {
      setProfile(user)
      const key = goalKeyFor(user?.email)
      const raw = localStorage.getItem(key)
      if (raw) {
        try {
          setGoal(JSON.parse(raw))
        } catch {
          localStorage.removeItem(key)
        }
      }
    }).catch(() => {
      setProfile({ name: 'Guest', mode: 'guest' })
    })

    getRecommendations().then(setRecommendations).catch(() => setRecommendations(null))
  }, [])

  useEffect(() => {
    if (!profile?.email) return
    localStorage.setItem(goalKeyFor(profile.email), JSON.stringify(goal))
  }, [goal, profile])

  const expenses = useMemo(() => {
    const list = data?.expenses || []
    if (!query) return list
    return list.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()))
  }, [data, query])

  const categoryData = useMemo(() => groupByCategory(data?.expenses || []), [data])
  const monthData = useMemo(() => groupByMonth(data?.expenses || []), [data])
  const insights = data?.insights || []

  const totals = useMemo(() => {
    const totalSpend = (data?.expenses || []).reduce((sum, item) => sum + Number(item.amount || 0), 0)
    const top = categoryData[0]
    return {
      totalSpend,
      topCategory: top?.category || '—',
      topValue: top?.amount || 0,
      expenseCount: (data?.expenses || []).length,
    }
  }, [data, categoryData])

  useEffect(() => {
    if (!totals.totalSpend || totals.totalSpend <= 0 || autoInsight) return

    const categorySummary = categoryData
      .slice(0, 5)
      .map((cat) => `- ${cat.category}: ₹${cat.amount.toFixed(2)}`)
      .join('\n')

    const spendingPattern = totals.topCategory
      ? `Most money goes to ${totals.topCategory}.`
      : 'Spending is spread across categories.'

    const summaryPrompt = `Top Categories:\n${categorySummary}\n\nSpending Pattern:\n${spendingPattern}\n\nSummarize my spending in 1 line and provide one action.`

    chatWithCoach(summaryPrompt)
      .then((res) => {
        setAutoInsight(res.reply || 'Looks good! Keep tracking your expenses.')
      })
      .catch(() => {
        setAutoInsight('Unable to generate auto-insight right now.')
      })
  }, [totals, categoryData, autoInsight])

  const handleAddExpense = async (event) => {
    event.preventDefault()
    await addExpense({ ...form, amount: Number(form.amount) })
    setForm({ amount: '', category: 'food_dining', date: today(), description: '' })
    retry()
  }

  const handleDeleteExpense = async (id) => {
    await deleteExpense(id)
    retry()
  }

  const handleChat = async (event) => {
    event.preventDefault()
    setChatReply('Analyzing your spending...')
    try {
      const res = await chatWithCoach(chatInput)
      setChatReply(res.reply || 'No reply received.')
    } catch (err) {
      setChatReply(err?.response?.data?.detail || 'AI service unavailable right now.')
    }
  }

  const notifications = useMemo(() => {
    const items = []
    if (totals.totalSpend > 0) {
      items.push({ title: 'Spending update', body: `You spent ₹${totals.totalSpend.toLocaleString()} so far. Top bucket: ${totals.topCategory}.`, unread: true })
    } else {
      items.push({ title: 'Start tracking', body: 'Add your first expense or import SMS to unlock insights.', unread: true })
    }
    if (recommendations?.plan?.length) {
      items.push({ title: 'Savings plan ready', body: recommendations.plan[0], unread: false })
    }
    return items
  }, [totals, recommendations])

  const profileSubtitle = profile?.email ? `Restoring data for ${profile.email}` : 'Your data is account scoped and restored every login.'

  return (
    <motion.div
      className='min-h-screen bg-bg text-foreground'
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className='flex'>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

        <div className='flex min-h-screen flex-1 flex-col'>
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            onSearch={setQuery}
            title='AI Financial Dashboard'
            subtitle='Beautiful clarity for every money decision.'
            profile={profile}
            notifications={notifications}
          />

          {fallbackStatus && (
            <div className='mx-6 mb-2 rounded-lg border border-amber-200/30 bg-amber-200/10 px-4 py-2 text-sm text-amber-100'>
              {fallbackStatus}
            </div>
          )}

          <main className='space-y-6 p-4 pb-24 md:p-6'>
            <motion.section
              className='rounded-3xl border border-border bg-card p-5 shadow-soft fancy-card floating-card interactive'
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
                <div>
                  <h2 className='text-2xl font-semibold'>Hello {profile?.name || 'Guest'} 👋</h2>
                  <p className='mt-1 text-sm text-muted'>{profileSubtitle}</p>
                  {autoInsight && (
                    <p className='mt-2 text-sm font-semibold text-yellow-600'>{autoInsight}</p>
                  )}
                </div>
                <div className='flex flex-wrap gap-2'>
                  <button type='button' onClick={() => navigate('/transactions')} className='rounded-xl border border-border px-4 py-3 text-sm font-semibold'>View transactions</button>
                  <button type='button' onClick={() => navigate('/coach')} className='rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white'>Open AI coach</button>
                </div>
              </div>
            </motion.section>

            <motion.section
              className='grid gap-4 lg:grid-cols-4'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <MetricCard title='Total spend' value={`₹${totals.totalSpend.toLocaleString()}`} subtitle='Across imported and manual entries' trend={`${totals.expenseCount} items`} tone='accent' />
              <MetricCard title='Top bucket' value={totals.topCategory} subtitle={`₹${totals.topValue.toLocaleString()} in that category`} trend='Need watch' tone='success' />
              <MetricCard title='Goal progress' value={`${Math.min(100, Math.round((goal.current / goal.target) * 100))}%`} subtitle={`₹${goal.current.toLocaleString()} saved`} trend='Goal track' tone='success' />
              <MetricCard title='AI availability' value={chatReply && chatReply !== 'Thinking...' ? 'Ready' : 'Live'} subtitle='DeepSeek-backed coach' trend='Educate' tone='accent' />
            </motion.section>

            <motion.section
              className='grid gap-4 xl:grid-cols-[1.15fr_0.85fr]'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.1 }}
            >
              <div className='space-y-4'>
                <form onSubmit={handleAddExpense} className='rounded-3xl border border-border bg-card p-5 shadow-soft'>
                  <h3 className='text-xl font-semibold'>Quick add expense</h3>
                  <div className='mt-4 grid gap-3 md:grid-cols-2'>
                    <input required type='number' placeholder='Amount' value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className='rounded-2xl border border-border bg-bg px-4 py-3 text-sm' />
                    <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className='rounded-2xl border border-border bg-bg px-4 py-3 text-sm'>
                      <option value='food_dining'>Food</option>
                      <option value='transport'>Travel</option>
                      <option value='rent'>Rent</option>
                      <option value='education'>Education</option>
                      <option value='others'>Others</option>
                    </select>
                    <input required type='date' value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className='rounded-2xl border border-border bg-bg px-4 py-3 text-sm' />
                    <input placeholder='Description' value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className='rounded-2xl border border-border bg-bg px-4 py-3 text-sm' />
                  </div>
                  <button type='submit' className='mt-4 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white'>Save expense</button>
                </form>

                <MonthlyTrendChart data={monthData} loading={loading} />
                <SpendingBarChart data={categoryData} loading={loading} />
              </div>

              <div className='space-y-4'>
                <GoalCard
                  title={goal.title}
                  current={goal.current}
                  target={goal.target}
                  onAddFunds={(amount) => setGoal((prev) => ({ ...prev, current: prev.current + amount }))}
                  onAdjustGoal={(amount) => setGoal((prev) => ({ ...prev, target: amount }))}
                />
                <NudgePanel />
                <section className='rounded-3xl border border-border bg-card p-5 shadow-soft'>
                  <h3 className='text-xl font-semibold'>AI recommendations</h3>
                  <div className='mt-4 grid gap-3'>
                    {(recommendations?.plan || [
                      'Create a 3-6 month emergency fund.',
                      'Automate a fixed transfer on salary day.',
                      'Review categories weekly and cut one repeated expense.',
                    ]).slice(0, 3).map((item) => (
                      <div key={item} className='rounded-2xl border border-border bg-bg p-4 text-sm'>{item}</div>
                    ))}
                  </div>
                </section>
              </div>
            </motion.section>

            <motion.section
              className='grid gap-4 xl:grid-cols-[0.95fr_1.05fr]'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.15 }}
            >
              <div className='space-y-4'>
                <section className='rounded-3xl border border-border bg-card p-5 shadow-soft'>
                  <h3 className='text-xl font-semibold'>AI insights</h3>
                  <ul className='mt-4 space-y-3'>
                    {insights.length ? insights.map((item) => <li key={item} className='rounded-2xl bg-bg p-3 text-sm'>{item}</li>) : <li className='rounded-2xl bg-bg p-3 text-sm text-muted'>No insights yet. Add your first expense to unlock them.</li>}
                  </ul>
                </section>

                <section className='rounded-3xl border border-border bg-card p-5 shadow-soft'>
                  <h3 className='text-xl font-semibold'>AI Coach</h3>
                  <form onSubmit={handleChat} className='mt-4 flex gap-2'>
                    <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} className='flex-1 rounded-2xl border border-border bg-bg px-4 py-3 text-sm' placeholder='Ask about saving, SIPs, budgets, or spending' />
                    <button type='submit' className='rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white'>Ask</button>
                  </form>
                  {chatReply ? <p className='mt-4 whitespace-pre-wrap rounded-2xl border border-border bg-bg p-4 text-sm leading-6'>{chatReply}</p> : null}
                </section>
              </div>

              <section className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-xl font-semibold'>Recent transactions</h3>
                  <button type='button' onClick={() => navigate('/transactions')} className='rounded-xl border border-border px-4 py-2 text-sm font-semibold'>Open manager</button>
                </div>
                {error ? <p className='text-sm text-danger'>Failed to load data.</p> : null}
                <TxTable
                  rows={expenses.map((e) => ({ ...e, merchant: e.description, date: e.date }))}
                  loading={loading}
                  onAddTxn={() => navigate('/transactions')}
                  onImportSms={() => navigate('/transactions')}
                  onDelete={handleDeleteExpense}
                />
              </section>
            </motion.section>
          </main>
        </div>
      </div>

      <BottomNav />
    </motion.div>
  )
}
