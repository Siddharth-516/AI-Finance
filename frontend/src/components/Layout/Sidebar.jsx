/** Purpose: responsive and keyboard accessible sidebar navigation with collapse support. */
import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import classNames from 'classnames'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '◫' },
  { to: '/transactions', label: 'Transactions', icon: '▤' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

export default function Sidebar({ isOpen, setIsOpen }) {
  const [collapsed, setCollapsed] = useState(false)

  const onKeyToggle = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsOpen((prev) => !prev)
    }
  }

  return (
    <aside
      className={classNames(
        'fixed inset-y-0 left-0 z-40 border-r border-border bg-card/90 backdrop-blur-xl transition-all md:translate-x-0 md:static md:inset-auto',
        collapsed ? 'w-20' : 'w-72',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
      aria-label='Sidebar navigation'
      data-testid='sidebar'
    >
      <div className='flex h-16 items-center justify-between border-b border-border px-4'>
        <Link to='/dashboard' className={classNames('font-semibold text-foreground transition-all', collapsed ? 'text-sm' : 'text-lg')}>
          {collapsed ? 'AIFC' : 'AI Financial Companion'}
        </Link>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            className='hidden rounded-lg p-2 text-muted hover:bg-muted/30 md:block'
            onClick={() => setCollapsed((p) => !p)}
            aria-label='Collapse sidebar'
          >
            {collapsed ? '»' : '«'}
          </button>
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
      </div>

      <nav className='space-y-1 p-3'>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              classNames(
                'flex items-center rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-muted/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent',
                collapsed ? 'justify-center' : 'gap-2',
                isActive ? 'bg-accent/15 text-accent' : 'text-foreground'
              )
            }
            title={item.label}
          >
            <span>{item.icon}</span>
            {!collapsed ? item.label : null}
          </NavLink>
        ))}
      </nav>

      {!collapsed ? (
        <div className='m-3 rounded-xl border border-accent/30 bg-accent/10 p-3 text-xs text-muted'>
          <p className='font-semibold text-foreground'>Prototyping for impact</p>
          <p className='mt-1'>Focus on innovation, execution quality, and measurable user outcomes.</p>
        </div>
      ) : null}
    </aside>
  )
}
