/** Purpose: accessible transaction table with loading and empty states. */
import React from 'react'

export default function TxTable({ rows = [], loading = false, onImportSms, onAddTxn, onDelete }) {
  if (loading) {
    return <div className='h-64 animate-pulse rounded-2xl border border-border bg-card' data-testid='tx-table-loading' />
  }

  if (!rows.length) {
    return (
      <div className='rounded-2xl border border-dashed border-border bg-card p-8 text-center' data-testid='tx-table-empty'>
        <p className='text-sm text-muted'>No transactions yet.</p>
        <div className='mt-4 flex flex-wrap justify-center gap-2'>
          <button type='button' onClick={onImportSms} className='rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white'>Import SMS</button>
          <button type='button' onClick={onAddTxn} className='rounded-xl border border-border px-4 py-2 text-sm text-foreground'>Add first txn</button>
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
            <th className='px-4 py-3 text-right'>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((tx) => (
            <tr key={tx.id} className='border-b border-border/70 last:border-b-0 hover:bg-muted/10'>
              <td className='px-4 py-4 text-muted'>{tx.date || tx.txn_date}</td>
              <td className='px-4 py-4 text-foreground'>{tx.merchant || tx.title || tx.description || '—'}</td>
              <td className='px-4 py-4'>
                <span className='rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent'>{tx.category || 'others'}</span>
              </td>
              <td className='px-4 py-4 text-right font-semibold text-foreground'>₹{Number(tx.amount || 0).toLocaleString()}</td>
              <td className='px-4 py-4 text-right'>
                {onDelete ? (
                  <button type='button' onClick={() => onDelete(tx.id)} className='rounded-xl border border-danger/40 px-4 py-2 text-xs font-semibold text-danger hover:bg-danger/10'>
                    Delete
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
