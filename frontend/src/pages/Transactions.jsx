/** Purpose: transactions page with import, filters, analytics strip, and table listing. */
import React, { useEffect, useMemo, useState } from 'react'
import Header from '../components/Layout/Header'
import Sidebar from '../components/Layout/Sidebar'
import BottomNav from '../components/Layout/BottomNav'
import TxTable from '../components/Transactions/TxTable'
import useFetch from '../hooks/useFetch'
import { getTransactions, importSms } from '../services/api'

export default function Transactions() {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [importMessage, setImportMessage] = useState('')
  const [category, setCategory] = useState('all')

  const { data, loading, error, retry } = useFetch(() => getTransactions({ page: 1, pageSize: 20 }), [])

  const rows = useMemo(() => {
    const list = Array.isArray(data) ? data : []
    return list.filter((item) => {
      const qPass = JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
      const catPass = category === 'all' ? true : String(item.category).toLowerCase() === category
      return qPass && catPass
    })
  }, [data, query, category])

  const total = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0)

  const handleFileImport = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const result = await importSms(file)
      setImportMessage(`Imported preview rows: ${result.count || 0}`)
      retry()
    } catch (err) {
      setImportMessage('Import failed. Please check file format and try again.')
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined' || !('requestIdleCallback' in window)) return undefined
    const id = window.requestIdleCallback(() => getTransactions({ page: 2, pageSize: 20 }).catch(() => null))
    return () => window.cancelIdleCallback?.(id)
  }, [])

  return (
    <div className='min-h-screen bg-bg text-foreground'>
      <div className='flex'>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
        <div className='flex min-h-screen flex-1 flex-col'>
          <Header onMenuClick={() => setSidebarOpen(true)} onSearch={setQuery} title='Transactions' />
          <main className='space-y-4 p-4 pb-24 md:p-6' data-testid='transactions-page'>
            <section className='grid gap-3 sm:grid-cols-3'>
              <div className='glass-card rounded-xl border border-border p-4'>
                <p className='text-xs uppercase text-muted'>Visible Transactions</p>
                <p className='mt-1 text-2xl font-semibold'>{rows.length}</p>
              </div>
              <div className='glass-card rounded-xl border border-border p-4'>
                <p className='text-xs uppercase text-muted'>Total Amount</p>
                <p className='mt-1 text-2xl font-semibold'>₹{total.toLocaleString()}</p>
              </div>
              <div className='glass-card rounded-xl border border-border p-4'>
                <p className='text-xs uppercase text-muted'>Data Quality</p>
                <p className='mt-1 text-2xl font-semibold'>98%</p>
              </div>
            </section>

            <section className='glass-card rounded-2xl border border-border p-4'>
              <h2 className='text-lg font-semibold'>Import SMS</h2>
              <p className='mt-1 text-sm text-muted'>Upload a text file with one SMS per line.</p>
              <div className='mt-3 flex flex-wrap items-center gap-2'>
                <label className='flex w-fit cursor-pointer items-center rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white'>
                  Choose file
                  <input type='file' accept='.txt,.csv' className='sr-only' onChange={handleFileImport} />
                </label>
                <button type='button' className='rounded-lg border border-border px-3 py-2 text-sm'>Download template</button>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className='rounded-lg border border-border bg-card px-3 py-2 text-sm'
                  aria-label='Filter category'
                >
                  <option value='all'>All categories</option>
                  <option value='food'>Food</option>
                  <option value='rent'>Rent</option>
                  <option value='transport'>Transport</option>
                </select>
              </div>
              {importMessage ? <p className='mt-2 text-sm text-muted'>{importMessage}</p> : null}
            </section>

            {error ? (
              <div className='rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger'>
                Could not load transactions.
                <button type='button' className='ml-2 underline' onClick={retry}>Retry</button>
              </div>
            ) : null}

            <TxTable rows={rows} loading={loading} />
          </main>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
