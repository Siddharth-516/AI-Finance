/** Purpose: immersive financial dashboard blending analytics, coaching, and showcase UX. */
import React, { useMemo, useState } from 'react'
import Header from '../components/Layout/Header'
import Sidebar from '../components/Layout/Sidebar'
import BottomNav from '../components/Layout/BottomNav'
import InsightCard from '../components/Cards/InsightCard'
import MetricCard from '../components/Cards/MetricCard'
import GoalCard from '../components/Cards/GoalCard'
import MonthlyTrendChart from '../components/Charts/MonthlyTrendChart'
import SpendingBarChart from '../components/Charts/SpendingBarChart'
import TxTable from '../components/Transactions/TxTable'
import TimelineCard from '../components/Widgets/TimelineCard'
import NudgePanel from '../components/Widgets/NudgePanel'
import AnimatedBackdrop from '../components/FX/AnimatedBackdrop'
import useFetch from '../hooks/useFetch'
import { getDashboardSummary } from '../services/api'

const mockMonthly = [
  { month: '2024-05', total: 780 },
  { month: '2024-06', total: 860 },
  { month: '2024-07', total: 940 },
  { month: '2024-08', total: 1010 },
  { month: '2024-09', total: 890 },
  { month: '2024-10', total: 1080 },
  { month: '2024-11', total: 1120 },
  { month: '2024-12', total: 1170 },
  { month: '2025-01', total: 930 },
  { month: '2025-02', total: 900 },
  { month: '2025-03', total: 1250 },
  { month: '2025-04', total: 1090 },
]

const mockCategories = [
  { category: 'Food', amount: 500 },
  { category: 'Rent', amount: 400 },
  { category: 'Transport', amount: 150 },
  { category: 'Entertainment', amount: 100 },
  { category: 'Other', amount: 100 },
]

const mockTransactions = [
  { id: '1', date: '2025-04-03', title: 'Grocery', amount: 120, category: 'Food', merchant: 'BigBasket' },
  { id: '2', date: '2025-04-05', title: 'Cab', amount: 240, category: 'Transport', merchant: 'Uber' },
  { id: '3', date: '2025-04-07', title: 'Rent', amount: 400, category: 'Rent', merchant: 'Landlord' },
  { id: '4', date: '2025-04-08', title: 'SIP', amount: 5000, category: 'Investments', merchant: 'Index SIP' },
]

export default function Dashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [isModalOpen, setModalOpen] = useState(false)

  const { data, loading, error, retry } = useFetch(getDashboardSummary, [])

  const summary = {
    total_spent: 1250,
    total_income: 2000,
    net_savings: 750,
    saving_rate: 37,
  }

  const insights = data?.insights?.length
    ? data.insights
    : [
        'You spent 40% more on food in March vs Feb. Consider a small meal-plan next month.',
        'Transport costs are rising weekly. Try setting a fixed commute cap for weekdays.',
        'Emergency fund progress is steady. Keep auto-saving right after salary credit.',
      ]

  const transactions = data?.transactions?.length ? data.transactions : mockTransactions

  const filteredTx = useMemo(() => {
    if (!query) return transactions
    return transactions.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()))
  }, [transactions, query])

  const monthly = mockMonthly
  const categories = mockCategories

  return (
    <div className='min-h-screen bg-bg text-foreground'>
      <div className='flex'>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

        <div className='relative flex min-h-screen flex-1 flex-col overflow-hidden'>
          <AnimatedBackdrop />
          <Header onMenuClick={() => setSidebarOpen(true)} onSearch={setQuery} />

          <main className='relative z-10 space-y-6 p-4 pb-24 md:p-6' data-testid='dashboard-page'>
            <section className='glass-card relative overflow-hidden rounded-3xl border border-border p-6'>
              <div className='absolute -right-16 -top-16 h-44 w-44 rounded-full bg-accent/20 blur-3xl' />
              <p className='text-xs uppercase tracking-[0.2em] text-accent'>Prototype Excellence Mode</p>
              <h1 className='mt-2 text-3xl font-semibold leading-tight md:text-4xl'>
                Build wealth habits with AI precision and stunning clarity.
              </h1>
              <p className='mt-3 max-w-3xl text-sm text-muted'>
                A premium command center for students and young professionals: smarter insights, elegant visual storytelling,
                and nudges that convert intent into action.
              </p>
              <div className='mt-5 flex flex-wrap gap-3'>
                <button type='button' className='btn-glow rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white'>
                  Start smart import
                </button>
                <button type='button' className='rounded-xl border border-border px-4 py-2 text-sm font-semibold'>
                  Watch demo flow
                </button>
              </div>
            </section>

            {error ? (
              <div className='rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger'>
                Unable to load dashboard right now.
                <button type='button' className='ml-2 underline' onClick={retry}>Retry</button>
              </div>
            ) : null}

            <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
              <MetricCard title='Total Spent' value={`₹${summary.total_spent.toLocaleString()}`} subtitle='Estimated for this month' trend='+12%' tone='danger' />
              <MetricCard title='Income' value={`₹${summary.total_income.toLocaleString()}`} subtitle='Estimated for this month' trend='+4%' tone='success' />
              <MetricCard title='Net Savings' value={`₹${summary.net_savings.toLocaleString()}`} subtitle='Estimated for this month' trend='+9%' tone='success' />
              <MetricCard title='Saving Rate' value={`${summary.saving_rate}%`} subtitle='Estimated for this month' trend='+3%' tone='accent' />
            </section>

            <section className='grid gap-4 xl:grid-cols-3'>
              <div className='space-y-4 xl:col-span-2'>
                <MonthlyTrendChart data={monthly} loading={loading} />
                <SpendingBarChart data={categories} loading={loading} />
              </div>
              <div className='space-y-4'>
                {insights.map((item, idx) => (
                  <InsightCard key={item} title={`AI Insight ${idx + 1}`} body={item} />
                ))}
                <GoalCard title='Emergency Fund Goal' current={42000} target={100000} />
              </div>
            </section>

            <section className='grid gap-4 xl:grid-cols-3'>
              <div className='xl:col-span-2'>
                <TxTable rows={filteredTx} loading={loading} />
              </div>
              <div className='space-y-4'>
                <NudgePanel />
                <TimelineCard />
              </div>
            </section>
          </main>
        </div>
      </div>

      <button
        type='button'
        className='btn-glow fixed bottom-20 right-4 z-40 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg transition active:scale-95 md:bottom-6 md:right-6'
        onClick={() => setModalOpen(true)}
        data-testid='fab-add'
      >
        Add transaction
      </button>

      {isModalOpen ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4'>
          <div className='glass-card w-full max-w-md rounded-2xl border border-border p-5 shadow-lg'>
            <h3 className='text-lg font-semibold'>Quick add transaction</h3>
            <p className='mt-1 text-sm text-muted'>Capture spending in a few taps.</p>
            <div className='mt-4 grid gap-3'>
              <input type='text' placeholder='Merchant' className='rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40' />
              <input type='number' placeholder='Amount (INR)' className='rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40' />
            </div>
            <div className='mt-4 flex justify-end gap-2'>
              <button type='button' className='rounded-lg border border-border px-3 py-2 text-sm' onClick={() => setModalOpen(false)}>Close</button>
              <button type='button' className='rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white' onClick={() => setModalOpen(false)}>Save</button>
            </div>
          </div>
        </div>
      ) : null}

      <BottomNav />
    </div>
  )
}
