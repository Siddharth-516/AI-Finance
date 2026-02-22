/** Purpose: hackathon/progress timeline visual card with phase checkpoints. */
import React from 'react'

const phases = [
  {
    title: 'Phase 1 — Ideation',
    desc: 'Problem framing, persona validation, and architecture blueprint.',
    status: 'done',
  },
  {
    title: 'Phase 2 — Prototype Submission',
    desc: 'Functional demo with polished UX, insights engine, and impactful storytelling.',
    status: 'active',
  },
  {
    title: 'Phase 3 — Online Build Marathon',
    desc: 'Scale reliability, strengthen metrics, and iterate on judge feedback.',
    status: 'upcoming',
  },
]

export default function TimelineCard() {
  return (
    <section className='glass-card rounded-2xl border border-border p-5' data-testid='timeline-card'>
      <h3 className='text-lg font-semibold'>Road to finals</h3>
      <p className='mt-1 text-sm text-muted'>Execution quality + impact = winning edge.</p>
      <div className='mt-4 space-y-4'>
        {phases.map((phase) => (
          <div key={phase.title} className='flex gap-3'>
            <div className='mt-1 flex flex-col items-center'>
              <span
                className={`h-3 w-3 rounded-full ${
                  phase.status === 'done' ? 'bg-success' : phase.status === 'active' ? 'bg-accent animate-pulse-soft' : 'bg-muted'
                }`}
              />
              <span className='mt-1 h-full w-px bg-border' />
            </div>
            <div>
              <p className='font-medium'>{phase.title}</p>
              <p className='text-sm text-muted'>{phase.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
