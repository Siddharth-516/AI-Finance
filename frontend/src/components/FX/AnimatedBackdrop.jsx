/** Purpose: reusable animated gradient and grid backdrop for premium visual depth. */
import React from 'react'

export default function AnimatedBackdrop() {
  return (
    <div className='pointer-events-none absolute inset-0 overflow-hidden' aria-hidden='true'>
      <div className='absolute -left-20 top-10 h-72 w-72 animate-float rounded-full bg-accent/20 blur-3xl' />
      <div className='absolute right-0 top-40 h-80 w-80 animate-float-delayed rounded-full bg-success/20 blur-3xl' />
      <div className='absolute bottom-0 left-1/3 h-56 w-56 animate-pulse-soft rounded-full bg-sky-400/20 blur-3xl' />
      <div className='absolute inset-0 bg-grid-mask opacity-40' />
    </div>
  )
}
