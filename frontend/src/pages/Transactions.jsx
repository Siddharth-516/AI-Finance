/** Purpose: transactions page with import and table listing. */
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

  const { data, loading, error, retry } = useFetch(() => getTransactions({ page: 1, pageSize: 20 }), [])

  const rows = useMemo(() => {
    const list = Array.isArray(data) ? data : []
    return list.filter((item) => JSON.stringify(item).toLowerCase().includes(query.toLowerCase()))
  }, [data, query])

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
    if (typeof window === 'undefined' || !('requestIdleCallback' in window)) return
    const id = window.requestIdleCallback(() => getTransactions({ page: 2, pageSize: 20 }).catch(() => null))
    return () => window.cancelIdleCallback?.(id)
  }, [])

  return (
    <div className='min-h-screen bg-bg text-foreground'>
      <div className='flex'>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
        <div className='flex min-h-screen flex-1 flex-col'>
          <Header onMenuClick={() => setSidebarOpen(true)} onSearch={setQuery} />
          <main className='space-y-4 p-4 pb-24 md:p-6' data-testid='transactions-page'>
            <section className='rounded-2xl border border-border bg-card p-4'>
              <h2 className='text-lg font-semibold'>Import SMS</h2>
              <p className='mt-1 text-sm text-muted'>Upload a text file with one SMS per line.</p>
              <label className='mt-3 flex w-fit cursor-pointer items-center rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white'>
                Choose file
                <input type='file' accept='.txt,.csv' className='sr-only' onChange={handleFileImport} />
              </label>
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
