/** Purpose: responsive and keyboard accessible sidebar navigation with collapse support. */
import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import classNames from 'classnames'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '▣' },
  { to: '/transactions', label: 'Transactions', icon: '▤' },
  { to: '/coach', label: 'AI Coach', icon: '✦' },
  { to: '/profile', label: 'Profile', icon: '◌' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
  { to: '/privacy', label: 'Privacy', icon: '✧' },
]

export default function Sidebar({ isOpen, setIsOpen }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={classNames(
        'fixed inset-y-0 left-0 z-40 border-r border-border bg-card/95 backdrop-blur-xl transition-all md:translate-x-0 md:static md:inset-auto',
        collapsed ? 'w-20' : 'w-72',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
      aria-label='Sidebar navigation'
    >
      <div className='flex h-16 items-center justify-between border-b border-border px-4'>
        <Link to='/dashboard' className='text-sm font-semibold uppercase tracking-[0.18em] text-foreground'>
          {collapsed ? 'AIFC' : 'AI Financial Companion'}
        </Link>
        <div className='flex items-center gap-2'>
          <button type='button' className='hidden rounded-lg p-2 text-muted hover:bg-muted/30 md:block' onClick={() => setCollapsed((p) => !p)} aria-label='Collapse sidebar'>
            {collapsed ? '»' : '«'}
          </button>
          <button type='button' className='rounded-lg p-2 text-muted hover:bg-muted/30 md:hidden' onClick={() => setIsOpen(false)} aria-label='Close sidebar'>
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
                'flex items-center rounded-2xl px-3 py-3 text-sm font-medium transition hover:bg-muted/30 interactive',
                collapsed ? 'justify-center' : 'gap-3',
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
        <div className='m-3 rounded-2xl border border-accent/30 bg-accent/8 p-4'>
          <p className='text-sm font-semibold'>Prototype excellence mode</p>
          <p className='mt-2 text-sm text-muted'>Focus on clear navigation, working actions, and account-scoped money habits.</p>
        </div>
      ) : null}
    </aside>
  )
}
