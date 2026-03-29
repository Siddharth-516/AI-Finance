/** Purpose: mobile bottom navigation for quick route switching. */
import React from 'react'
import { NavLink } from 'react-router-dom'

const navClass = ({ isActive }) =>
  `rounded-2xl px-2 py-2 text-center text-xs font-medium transition ${isActive ? 'bg-accent/15 text-accent' : 'text-muted hover:text-foreground'}`

export default function BottomNav() {
  return (
    <nav className='fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 gap-1 border-t border-border bg-card px-2 py-2 md:hidden' aria-label='Bottom navigation'>
      <NavLink to='/dashboard' className={navClass}>Dashboard</NavLink>
      <NavLink to='/transactions' className={navClass}>Transactions</NavLink>
      <NavLink to='/coach' className={navClass}>AI Coach</NavLink>
      <NavLink to='/profile' className={navClass}>Profile</NavLink>
    </nav>
  )
}
