/** Purpose: goal progress card with milestone state and CTA actions. */
import React, { useMemo, useState } from 'react'

export default function GoalCard({ title, current, target, onAddFunds, onAdjustGoal }) {
  const [mode, setMode] = useState(null)
  const [value, setValue] = useState('')

  const pct = useMemo(() => {
    if (!target) return 0
    return Math.min(100, Math.round((Number(current) / Number(target)) * 100))
  }, [current, target])

  const close = () => {
    setMode(null)
    setValue('')
  }

  const submit = () => {
    const amount = Number(value)
    if (!Number.isFinite(amount) || amount <= 0) return
    if (mode === 'add' && onAddFunds) onAddFunds(amount)
    if (mode === 'goal' && onAdjustGoal) onAdjustGoal(amount)
    close()
  }

  return (
    <article className='glass-card rounded-2xl border border-border p-4 shadow-soft fancy-card floating-card interactive'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h3 className='text-base font-semibold'>{title}</h3>
          <p className='text-sm text-muted'>Build this steadily with weekly auto-transfers.</p>
        </div>
        <span className='rounded-full bg-success/20 px-3 py-1 text-xs font-semibold text-success'>{pct}%</span>
      </div>
      <p className='mt-4 text-lg font-semibold'>₹{Number(current).toLocaleString()} / ₹{Number(target).toLocaleString()}</p>
      <div className='mt-3 h-2 rounded-full bg-muted/20'>
        <div className='h-2 rounded-full bg-gradient-to-r from-success to-accent' style={{ width: `${pct}%` }} />
      </div>
      <div className='mt-4 flex gap-2'>
        <button type='button' onClick={() => setMode('add')} className='rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white'>Add funds</button>
        <button type='button' onClick={() => setMode('goal')} className='rounded-xl border border-border px-4 py-2 text-xs font-semibold'>Adjust goal</button>
      </div>

      {mode ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4'>
          <div className='w-full max-w-sm rounded-3xl border border-border bg-card p-5 shadow-soft'>
            <h4 className='text-lg font-semibold'>{mode === 'add' ? 'Add funds' : 'Adjust goal'}</h4>
            <p className='mt-2 text-sm text-muted'>
              {mode === 'add' ? 'Enter how much you want to add to the goal.' : 'Enter a new target amount for the goal.'}
            </p>
            <input
              autoFocus
              type='number'
              min='1'
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className='mt-4 w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm'
              placeholder='Amount'
            />
            <div className='mt-4 flex gap-2'>
              <button type='button' onClick={close} className='flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold'>Cancel</button>
              <button type='button' onClick={submit} className='flex-1 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white'>Save</button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  )
}
