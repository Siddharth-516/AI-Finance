/** Purpose: insight card component for concise AI recommendations. */
import React from 'react'

export default function InsightCard({ title, body }) {
  return (
    <article
      className='group rounded-2xl border border-border bg-card p-4 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-lg'
      data-testid='insight-card'
    >
      <h3 className='text-base font-semibold text-foreground'>{title}</h3>
      <p className='mt-2 text-sm leading-relaxed text-muted'>{body}</p>
      <p className='mt-3 text-xs font-medium text-accent'>Educational only — not financial advice.</p>
    </article>
  )
}
