/** Purpose: accessible transaction table with loading and empty states. */
import React from 'react'

export default function TxTable({ rows = [], loading = false }) {
  if (loading) {
    return <div className='h-64 animate-pulse rounded-2xl border border-border bg-card' data-testid='tx-table-loading' />
  }

  if (!rows.length) {
    return (
      <div className='rounded-2xl border border-dashed border-border bg-card p-8 text-center' data-testid='tx-table-empty'>
        <p className='text-sm text-muted'>No transactions yet.</p>
        <div className='mt-3 flex justify-center gap-2'>
          <button type='button' className='rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white'>Import SMS</button>
          <button type='button' className='rounded-lg border border-border px-3 py-2 text-sm text-foreground'>Add first txn</button>
        </div>
      </div>
    )
  }

  return (
    <div className='overflow-hidden rounded-2xl border border-border bg-card' data-testid='tx-table'>
      <table role='table' className='min-w-full text-sm'>
        <thead className='border-b border-border bg-muted/20 text-left text-xs uppercase tracking-wide text-muted'>
          <tr>
            <th className='px-4 py-3'>Date</th>
            <th className='px-4 py-3'>Merchant</th>
            <th className='px-4 py-3'>Category</th>
            <th className='px-4 py-3 text-right'>Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((tx) => (
            <tr key={tx.id} className='border-b border-border/70 last:border-b-0 hover:bg-muted/10'>
              <td className='px-4 py-3 text-muted'>{tx.date}</td>
              <td className='px-4 py-3 text-foreground'>{tx.merchant || tx.title}</td>
              <td className='px-4 py-3'>
                <span className='rounded-full bg-accent/15 px-2 py-1 text-xs font-medium text-accent'>{tx.category}</span>
              </td>
              <td className='px-4 py-3 text-right font-medium text-foreground'>₹{Number(tx.amount).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
