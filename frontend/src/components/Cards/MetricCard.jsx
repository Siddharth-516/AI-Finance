/** Purpose: metric card with trend, subtitle, and animated progress line. */
import React from 'react'
import classNames from 'classnames'

export default function MetricCard({ title, value, subtitle, trend = '+0%', tone = 'accent' }) {
  const toneClass = {
    accent: 'text-accent bg-accent/20',
    success: 'text-success bg-success/20',
    danger: 'text-danger bg-danger/20',
  }

  return (
    <article className='glass-card group rounded-2xl border border-border/80 p-4 transition duration-300 hover:-translate-y-1 hover:shadow-neon'>
      <p className='text-xs uppercase tracking-wide text-muted'>{title}</p>
      <p className='mt-2 text-2xl font-semibold'>{value}</p>
      <div className='mt-3 flex items-center justify-between'>
        <span className='text-xs text-muted'>{subtitle}</span>
        <span className={classNames('rounded-full px-2 py-1 text-xs font-semibold', toneClass[tone])}>{trend}</span>
      </div>
      <div className='mt-3 h-1.5 rounded-full bg-muted/20'>
        <div className='h-1.5 w-2/3 rounded-full bg-gradient-to-r from-accent to-sky-400 transition-all duration-700 group-hover:w-5/6' />
      </div>
    </article>
  )
}
