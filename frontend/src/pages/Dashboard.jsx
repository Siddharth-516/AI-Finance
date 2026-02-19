/** Purpose: premium dashboard page composed with charts, cards, and transactions. */
import React, { useMemo, useState } from 'react'
import Header from '../components/Layout/Header'
import Sidebar from '../components/Layout/Sidebar'
import BottomNav from '../components/Layout/BottomNav'
import InsightCard from '../components/Cards/InsightCard'
import MonthlyTrendChart from '../components/Charts/MonthlyTrendChart'
import SpendingBarChart from '../components/Charts/SpendingBarChart'
import TxTable from '../components/Transactions/TxTable'
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

  const overviewCards = [
    { label: 'Total Spent', value: `₹${summary.total_spent.toLocaleString()}` },
    { label: 'Income', value: `₹${summary.total_income.toLocaleString()}` },
    { label: 'Net Savings', value: `₹${summary.net_savings.toLocaleString()}` },
    { label: 'Saving Rate', value: `${summary.saving_rate}%` },
  ]

  return (
    <div className='min-h-screen bg-bg text-foreground'>
      <div className='flex'>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />

        <div className='flex min-h-screen flex-1 flex-col md:ml-0'>
          <Header onMenuClick={() => setSidebarOpen(true)} onSearch={setQuery} />

          <main className='space-y-6 p-4 pb-24 md:p-6' data-testid='dashboard-page'>
            {error ? (
              <div className='rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger'>
                Unable to load dashboard right now.
                <button type='button' className='ml-2 underline' onClick={retry}>Retry</button>
              </div>
            ) : null}

            <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
              {overviewCards.map((card) => (
                <article
                  key={card.label}
                  className='rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:-translate-y-0.5'
                >
                  <p className='text-sm text-muted'>Estimated for this month</p>
                  <p className='mt-2 text-xl font-semibold'>{card.value}</p>
                  <p className='mt-1 text-xs text-muted'>{card.label}</p>
                  <div className='mt-3 h-1.5 rounded bg-muted/25'>
                    <div className='h-1.5 w-2/3 rounded bg-accent' />
                  </div>
                </article>
              ))}
            </section>

            <section className='grid gap-4 xl:grid-cols-3'>
              <div className='xl:col-span-2'>
                <MonthlyTrendChart data={monthly} loading={loading} />
              </div>
              <div className='space-y-3'>
                {insights.map((item, idx) => (
                  <InsightCard key={item} title={`Insight ${idx + 1}`} body={item} />
                ))}
              </div>
            </section>

            <section className='grid gap-4 xl:grid-cols-2'>
              <SpendingBarChart data={categories} loading={loading} />
              <TxTable rows={filteredTx} loading={loading} />
            </section>
          </main>
        </div>
      </div>

      <button
        type='button'
        className='fixed bottom-20 right-4 z-40 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg transition active:scale-95 md:bottom-6 md:right-6'
        onClick={() => setModalOpen(true)}
        data-testid='fab-add'
      >
        Add transaction
      </button>

      {isModalOpen ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4'>
          <div className='w-full max-w-md rounded-2xl bg-card p-5 shadow-lg'>
            <h3 className='text-lg font-semibold'>Quick add transaction</h3>
            <p className='mt-1 text-sm text-muted'>Capture spending in a few taps.</p>
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
