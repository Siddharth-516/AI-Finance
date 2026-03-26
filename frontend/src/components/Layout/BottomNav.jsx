/** Purpose: mobile bottom navigation for quick route switching. */
import React from 'react'
import { NavLink } from 'react-router-dom'

export default function BottomNav() {
  return (
    <nav className='fixed bottom-0 left-0 right-0 z-30 grid grid-cols-3 border-t border-border bg-card px-2 py-2 md:hidden' aria-label='Bottom navigation'>
      <NavLink to='/dashboard' className='rounded-lg px-2 py-2 text-center text-sm text-muted hover:text-foreground'>Dashboard</NavLink>
      <NavLink to='/transactions' className='rounded-lg px-2 py-2 text-center text-sm text-muted hover:text-foreground'>Transactions</NavLink>
      <NavLink to='/settings' className='rounded-lg px-2 py-2 text-center text-sm text-muted hover:text-foreground'>Settings</NavLink>
    </nav>
  )
}
