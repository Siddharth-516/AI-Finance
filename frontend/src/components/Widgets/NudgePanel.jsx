/** Purpose: personalized coaching nudges with priority badges and actions. */
import React from 'react'

const nudges = [
  { text: 'Food spending is 18% above your weekly target. Plan 2 home-cooked meals.', priority: 'high' },
  { text: 'Emergency fund at 42%. Keep a recurring transfer every salary day.', priority: 'medium' },
  { text: 'You corrected 6 categories this month — model accuracy is improving.', priority: 'low' },
]

export default function NudgePanel() {
  const tone = {
    high: 'text-danger bg-danger/15',
    medium: 'text-amber-500 bg-amber-500/15',
    low: 'text-success bg-success/15',
  }

  return (
    <section className='glass-card rounded-2xl border border-border p-5' data-testid='nudge-panel'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>AI Habit Coach</h3>
        <span className='rounded-full bg-accent/15 px-2 py-1 text-xs font-semibold text-accent'>Live</span>
      </div>
      <ul className='mt-4 space-y-3'>
        {nudges.map((nudge) => (
          <li key={nudge.text} className='rounded-xl border border-border/70 bg-card/60 p-3'>
            <div className='flex items-start justify-between gap-3'>
              <p className='text-sm'>{nudge.text}</p>
              <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${tone[nudge.priority]}`}>
                {nudge.priority}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <p className='mt-3 text-xs text-muted'>Educational only — not financial advice.</p>
    </section>
  )
}
