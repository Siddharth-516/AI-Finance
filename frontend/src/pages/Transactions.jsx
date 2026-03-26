/** Purpose: transactions/expenses manager with edit-delete controls and import preview placeholder. */
import React, { useMemo, useState } from 'react'
import Header from '../components/Layout/Header'
import Sidebar from '../components/Layout/Sidebar'
import BottomNav from '../components/Layout/BottomNav'
import TxTable from '../components/Transactions/TxTable'
import useFetch from '../hooks/useFetch'
import { deleteExpense, getExpenses } from '../services/api'

export default function Transactions() {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')

  const { data, loading, error, retry } = useFetch(getExpenses, [])

  const rows = useMemo(() => {
    const list = Array.isArray(data) ? data : []
    if (!query) return list
    return list.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()))
  }, [data, query])

  const handleDelete = async (id) => {
    await deleteExpense(id)
    setMessage('Expense deleted')
    retry()
  }

  return (
    <div className='min-h-screen bg-bg text-foreground'>
      <div className='flex'>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
        <div className='flex min-h-screen flex-1 flex-col'>
          <Header onMenuClick={() => setSidebarOpen(true)} onSearch={setQuery} title='Expense History' />
          <main className='space-y-4 p-4 pb-24 md:p-6'>
            <section className='rounded-2xl border border-border bg-card p-4'>
              <h2 className='text-lg font-semibold'>Your expenses</h2>
              <p className='text-sm text-muted'>Track and clean your expense timeline. Data is restored on your next login.</p>
              {message ? <p className='mt-2 text-sm text-success'>{message}</p> : null}
            </section>
            {error ? <p className='text-sm text-danger'>Failed loading expenses.</p> : null}
            <TxTable rows={rows.map((r) => ({ ...r, merchant: r.description, date: r.date }))} loading={loading} />
            <div className='flex flex-wrap gap-2'>
              {rows.slice(0, 4).map((row) => (
                <button key={row.id} type='button' onClick={() => handleDelete(row.id)} className='rounded-lg border border-danger/40 px-3 py-2 text-xs text-danger'>
                  Delete {row.category} ₹{Number(row.amount).toLocaleString()}
                </button>
              ))}
            </div>
          </main>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
