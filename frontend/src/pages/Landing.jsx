/** Purpose: cinematic landing page for first impressions and hackathon storytelling. */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import AnimatedBackdrop from '../components/FX/AnimatedBackdrop'
import { loadAuthToken } from '../services/api'

export default function Landing() {
  const navigate = useNavigate()
  const hasSession = Boolean(loadAuthToken())

  const openPrototype = () => {
    navigate('/dashboard')
  }

  const openLogin = () => {
    navigate('/dashboard')
  }

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
        <button type='button' onClick={openPrototype} className='rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white'>
          Open dashboard
        </button>
      </header>

      <main className='relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 pt-10'>
        <section className='glass-card rounded-3xl border border-border p-8 text-center md:p-14'>
          <p className='text-xs uppercase tracking-[0.25em] text-accent'>ET Gen AI Hackathon Ready</p>
          <h1 className='mx-auto mt-4 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl'>
            Turn noisy money data into calm, beautiful, actionable decisions.
          </h1>
          <p className='mx-auto mt-4 max-w-2xl text-base text-muted'>
            From Google login to SMS parsing and AI coaching, the experience keeps account data tied to the right profile and makes the next action obvious.
          </p>
          <div className='mt-8 flex flex-wrap items-center justify-center gap-3'>
            <button type='button' onClick={openPrototype} className='btn-glow rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white'>
              Experience the prototype
            </button>
            <button type='button' onClick={openLogin} className='rounded-xl border border-border px-5 py-3 text-sm font-semibold'>
              Continue with login
            </button>
          </div>
        </section>

        <section id='features' className='mt-10 grid gap-4 md:grid-cols-3'>
          {[
            ['Smart Tracking', 'Manual expenses, SMS import, duplicate checks, and category tagging.'],
            ['AI Coaching', 'Habit nudges, goal plans, and profile-aware educational guidance.'],
            ['Privacy First', 'Consent-driven parsing, export controls, and account deletion.'],
          ].map(([title, body]) => (
            <article key={title} className='glass-card rounded-2xl border border-border p-5'>
              <h2 className='text-xl font-semibold'>{title}</h2>
              <p className='mt-2 text-sm text-muted'>{body}</p>
            </article>
          ))}
        </section>

        <section id='impact' className='mt-10 grid gap-4 md:grid-cols-2'>
          <article className='glass-card rounded-2xl border border-border p-6'>
            <h2 className='text-xl font-semibold'>Why it matters</h2>
            <p className='mt-2 text-sm text-muted'>
              Students and early earners can see where their money goes, learn why it matters, and act faster with AI help.
            </p>
          </article>
          <article className='glass-card rounded-2xl border border-border p-6'>
            <h2 className='text-xl font-semibold'>What changes the demo</h2>
            <p className='mt-2 text-sm text-muted'>
              Dashboard, profile, privacy, and AI coach are now separate flows instead of one blocked screen.
            </p>
          </article>
        </section>
      </main>
    </div>
  )
}
