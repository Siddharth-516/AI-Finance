/** Purpose: transactions/expenses manager with edit-delete controls and SMS import support. */
import React, { useMemo, useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header'
import Sidebar from '../components/Layout/Sidebar'
import BottomNav from '../components/Layout/BottomNav'
import TxTable from '../components/Transactions/TxTable'
import useFetch from '../hooks/useFetch'
import {
  addExpense,
  createTransaction,
  deleteExpense,
  getExpenses,
  importSms,
  getProfile,
} from '../services/api'

const today = () => new Date().toISOString().slice(0, 10)

export default function Transactions() {
  const navigate = useNavigate()
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  const [profile, setProfile] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [form, setForm] = useState({
    txn_date: today(),
    amount: '',
    merchant: '',
    category: 'food_dining',
    notes: '',
    currency: 'INR',
  })
  const [smsText, setSmsText] = useState('')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const fileRef = useRef(null)

  const { data, loading, error, retry } = useFetch(getExpenses, [])

  useEffect(() => {
    getProfile().then(setProfile).catch(() => setProfile({ name: 'Guest', mode: 'guest' }))
  }, [])

  const rows = useMemo(() => {
    const list = Array.isArray(data) ? data : []
    if (!query) return list
    return list.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(query.toLowerCase())
    )
  }, [data, query])

  const handleDelete = async (id) => {
    await deleteExpense(id)
    setMessage('Expense deleted')
    retry()
  }

  const handleManualSubmit = async (event) => {
    event.preventDefault()
    const payload = {
      txn_date: form.txn_date,
      amount: Number(form.amount),
      merchant: form.merchant,
      category: form.category,
      notes: form.notes,
      currency: form.currency,
      tags: [],
    }
    await createTransaction(payload)
    await addExpense({
      amount: Number(form.amount),
      category: form.category,
      date: form.txn_date,
      description: form.merchant || form.notes || 'Manual entry',
    })
    setMessage('Transaction saved')
    setForm({
      txn_date: today(),
      amount: '',
      merchant: '',
      category: 'food_dining',
      notes: '',
      currency: 'INR',
    })
    setShowForm(false)
    retry()
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const text = await file.text()
    setSmsText(text)
    setShowImport(true)
  }

  const handleImport = async () => {
    const lines = smsText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)

    if (!lines.length) {
      setImportResult({
        saved: 0,
        count: 0,
        message: 'Add some SMS lines first.',
      })
      return
    }

    setImporting(true)

    try {
      const result = await importSms(lines)
      setImportResult(result)
      setMessage(`Imported ${result?.saved || 0} SMS transactions`)
      retry()
    } catch (err) {
      setImportResult({
        saved: 0,
        count: 0,
        message:
          err?.response?.data?.detail ||
          err?.message ||
          'SMS import failed.',
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <motion.div
      className='min-h-screen bg-bg text-foreground'
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3 }}
    >
      <div className='flex'>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
        <div className='flex min-h-screen flex-1 flex-col'>
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            onSearch={setQuery}
            title='Recent transactions'
            subtitle='Search, add, or delete transactions from here.'
            profile={profile}
          />

          <main className='space-y-4 p-4 pb-24 md:p-6'>
            <section className='rounded-3xl border border-border bg-card p-5 shadow-soft'>
              <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
                <div>
                  <h2 className='text-2xl font-semibold'>Transaction manager</h2>
                  <p className='mt-1 text-sm text-muted'>
                    Use the manual form or import a .txt SMS dump. Everything
                    saves against the active account.
                  </p>
                </div>
                <div className='flex flex-wrap gap-2'>
                  <button
                    type='button'
                    onClick={() => setShowForm((prev) => !prev)}
                    className='rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white'
                  >
                    Add transaction
                  </button>
                  <label className='cursor-pointer rounded-xl border border-border px-4 py-3 text-sm font-semibold'>
                    Import .txt
                    <input
                      ref={fileRef}
                      type='file'
                      accept='.txt,text/plain'
                      className='hidden'
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>
              {message ? <p className='mt-3 text-sm text-success'>{message}</p> : null}
            </section>

            {showForm ? (
              <section className='rounded-3xl border border-border bg-card p-5 shadow-soft'>
                <h3 className='text-xl font-semibold'>Quick add transaction</h3>
                <form onSubmit={handleManualSubmit} className='mt-4 grid gap-3 md:grid-cols-2'>
                  <input
                    required
                    type='date'
                    value={form.txn_date}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, txn_date: e.target.value }))
                    }
                    className='rounded-2xl border border-border bg-bg px-4 py-3 text-sm'
                  />
                  <input
                    required
                    type='number'
                    placeholder='Amount'
                    value={form.amount}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, amount: e.target.value }))
                    }
                    className='rounded-2xl border border-border bg-bg px-4 py-3 text-sm'
                  />
                  <input
                    placeholder='Merchant'
                    value={form.merchant}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, merchant: e.target.value }))
                    }
                    className='rounded-2xl border border-border bg-bg px-4 py-3 text-sm'
                  />
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className='rounded-2xl border border-border bg-bg px-4 py-3 text-sm'
                  >
                    <option value='food_dining'>Food</option>
                    <option value='transport'>Travel</option>
                    <option value='rent'>Rent</option>
                    <option value='education'>Education</option>
                    <option value='others'>Others</option>
                  </select>
                  <textarea
                    placeholder='Notes'
                    value={form.notes}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    className='min-h-28 rounded-2xl border border-border bg-bg px-4 py-3 text-sm md:col-span-2'
                  />
                  <div className='md:col-span-2 flex gap-2'>
                    <button
                      type='button'
                      onClick={() => setShowForm(false)}
                      className='rounded-xl border border-border px-4 py-3 text-sm font-semibold'
                    >
                      Close
                    </button>
                    <button
                      type='submit'
                      className='rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white'
                    >
                      Save
                    </button>
                  </div>
                </form>
              </section>
            ) : null}

            {showImport ? (
              <section className='rounded-3xl border border-border bg-card p-5 shadow-soft'>
                <h3 className='text-xl font-semibold'>Import SMS from .txt</h3>
                <p className='mt-1 text-sm text-muted'>
                  Paste SMS lines or upload a .txt file. The parser saves matching
                  transactions and expenses.
                </p>
                <textarea
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  className='mt-4 min-h-40 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm'
                  placeholder={`HDFC Bank: INR 230 paid at Swiggy on 12-04-2025
SBI alert: Rs. 850 debited via UPI to Uber on 13/04/2025`}
                />
                <div className='mt-4 flex flex-wrap gap-2'>
                  <button
                    type='button'
                    onClick={handleImport}
                    disabled={importing}
                    className='rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white disabled:opacity-60'
                  >
                    {importing ? 'Importing...' : 'Import SMS'}
                  </button>
                  <button
                    type='button'
                    onClick={() => setShowImport(false)}
                    className='rounded-xl border border-border px-4 py-3 text-sm font-semibold'
                  >
                    Hide importer
                  </button>
                </div>
                {importResult ? (
                  <p className='mt-3 text-sm text-muted'>
                    Saved: {importResult.saved || 0} / Parsed: {importResult.count || 0}
                    {importResult.message ? ` · ${importResult.message}` : ''}
                  </p>
                ) : null}
              </section>
            ) : null}

            {error ? <p className='text-sm text-danger'>Failed loading expenses.</p> : null}
            <TxTable
              rows={rows.map((r) => ({
                ...r,
                merchant: r.description,
                date: r.date,
              }))}
              loading={loading}
              onImportSms={() => setShowImport(true)}
              onAddTxn={() => setShowForm(true)}
              onDelete={handleDelete}
            />
          </main>
        </div>
      </div>
      <BottomNav />
    </motion.div>
  )
}