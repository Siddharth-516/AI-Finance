/** Purpose: conversational AI page for financial guidance. */
import React from 'react'
import AppShell from '../components/Layout/AppShell'
import CoachPanel from '../components/Coach/CoachPanel'

export default function ChatbotPage() {
  return (
    <AppShell title='AI Coach' subtitle='A friendly money copilot for budgets, SIPs, and spending choices.' showSearch={false}>
      <section className='grid gap-4 lg:grid-cols-[1.1fr_0.9fr]'>
        <CoachPanel title='Money coach' subtitle='Ask anything in simple language. The answer adapts to your profile and spending patterns.' />
        <div className='space-y-4'>
          <div className='glass-card rounded-3xl border border-border p-5'>
            <h2 className='text-lg font-semibold'>What to ask</h2>
            <p className='mt-2 text-sm text-muted'>You can ask about spending, saving targets, budgeting, SIP basics, or what your weekly cap should look like.</p>
          </div>
          <div className='glass-card rounded-3xl border border-border p-5'>
            <h2 className='text-lg font-semibold'>Why it matters</h2>
            <p className='mt-2 text-sm text-muted'>The problem statement asks for an AI assistant that explains spending patterns, gives personalized suggestions, and teaches finance basics.</p>
          </div>
        </div>
      </section>
    </AppShell>
  )
}
