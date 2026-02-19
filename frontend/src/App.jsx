/** Purpose: main UI shell with key pages */
import React, { useState } from 'react'
import DashboardPage from './pages/DashboardPage'
import TransactionsPage from './pages/TransactionsPage'

export default function App() {
  const [tab, setTab] = useState('dashboard')
  return (
    <div>
      <header><h1>AI Financial Companion</h1><p>EDUCATIONAL_ONLY: This application provides educational information and is not financial advice. Consult a certified financial advisor before making investment decisions.</p></header>
      <nav aria-label='Top navigation'>
        <button onClick={() => setTab('dashboard')}>Dashboard</button>
        <button onClick={() => setTab('transactions')}>Transactions</button>
      </nav>
      {tab === 'dashboard' ? <DashboardPage /> : <TransactionsPage />}
      <button aria-label='quick add' className='fab'>+</button>
    </div>
  )
}
