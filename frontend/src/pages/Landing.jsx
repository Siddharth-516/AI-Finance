/** Purpose: cinematic landing page for first impressions and hackathon storytelling. */
import React from 'react'
import { Link } from 'react-router-dom'
import AnimatedBackdrop from '../components/FX/AnimatedBackdrop'

export default function Landing() {
  return (
    <div className='relative min-h-screen overflow-hidden bg-bg text-foreground'>
      <AnimatedBackdrop />
      <header className='relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between p-6'>
        <p className='text-lg font-semibold'>AI Financial Companion</p>
        <nav className='hidden items-center gap-6 text-sm text-muted md:flex'>
          <a href='#features' className='hover:text-foreground'>Features</a>
          <a href='#impact' className='hover:text-foreground'>Impact</a>
          <a href='#faq' className='hover:text-foreground'>FAQ</a>
        </nav>
        <Link to='/dashboard' className='rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white'>Open Dashboard</Link>
      </header>

      <main className='relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 pt-10'>
        <section className='glass-card rounded-3xl border border-border p-8 text-center md:p-14'>
          <p className='text-xs uppercase tracking-[0.25em] text-accent'>ET Gen AI Hackathon Ready</p>
          <h1 className='mx-auto mt-4 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl'>
            Turn noisy money data into calm, beautiful, actionable decisions.
          </h1>
          <p className='mx-auto mt-4 max-w-2xl text-base text-muted'>
            From SMS parsing to AI coaching, our experience blends trust, speed, and visual clarity so users feel in control from the first click.
          </p>
          <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
            <Link to='/dashboard' className='btn-glow rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white'>
              Experience the prototype
            </Link>
            <Link to='/transactions' className='rounded-xl border border-border px-5 py-3 text-sm font-semibold'>
              Import sample SMS
            </Link>
          </div>
        </section>

        <section id='features' className='mt-10 grid gap-4 md:grid-cols-3'>
          {[
            ['Smart Tracking', 'Auto/manual expenses, duplicate detection, and confidence tagging.'],
            ['AI Coaching', 'Habit nudges, goal plans, and risk-aware educational guidance.'],
            ['Privacy First', 'Consent-driven parsing and safe handling of personal financial data.'],
          ].map(([title, body]) => (
            <article key={title} className='glass-card rounded-2xl border border-border p-5'>
              <h2 className='text-xl font-semibold'>{title}</h2>
              <p className='mt-2 text-sm text-muted'>{body}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
