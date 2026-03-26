/** Purpose: goal progress card with milestone state and CTA actions. */
import React from 'react'

export default function GoalCard({ title, current, target }) {
  const pct = Math.min(100, Math.round((current / target) * 100))
  return (
    <article className='glass-card rounded-2xl border border-border p-4' data-testid='goal-card'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h3 className='text-base font-semibold'>{title}</h3>
          <p className='text-sm text-muted'>Build this steadily with weekly auto-transfers.</p>
        </div>
        <span className='rounded-full bg-success/20 px-2 py-1 text-xs font-semibold text-success'>{pct}%</span>
      </div>
      <p className='mt-4 text-lg font-semibold'>₹{current.toLocaleString()} / ₹{target.toLocaleString()}</p>
      <div className='mt-3 h-2 rounded-full bg-muted/20'>
        <div className='h-2 rounded-full bg-gradient-to-r from-success to-accent' style={{ width: `${pct}%` }} />
      </div>
      <div className='mt-4 flex gap-2'>
        <button type='button' className='rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white'>Add funds</button>
        <button type='button' className='rounded-lg border border-border px-3 py-2 text-xs font-semibold'>Adjust goal</button>
      </div>
    </article>
  )
}
