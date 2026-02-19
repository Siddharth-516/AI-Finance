/** Purpose: responsive and keyboard accessible sidebar navigation. */
import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import classNames from 'classnames'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/settings', label: 'Settings' },
]

export default function Sidebar({ isOpen, setIsOpen }) {
  const onKeyToggle = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsOpen((prev) => !prev)
    }
  }

  return (
    <aside
      className={classNames(
        'fixed inset-y-0 left-0 z-40 w-72 border-r border-border bg-card/95 backdrop-blur transition-transform md:translate-x-0 md:static md:inset-auto',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
      aria-label='Sidebar navigation'
      data-testid='sidebar'
    >
      <div className='flex h-16 items-center justify-between border-b border-border px-4'>
        <Link to='/dashboard' className='text-lg font-semibold text-foreground'>
          AI Financial Companion
        </Link>
        <button
          type='button'
          className='rounded-lg p-2 text-muted hover:bg-muted/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent md:hidden'
          onClick={() => setIsOpen(false)}
          aria-label='Close sidebar'
          onKeyDown={onKeyToggle}
        >
          ✕
        </button>
      </div>

      <nav className='space-y-1 p-3'>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              classNames(
                'flex items-center rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-muted/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent',
                isActive ? 'bg-accent/15 text-accent' : 'text-foreground'
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
