/** Purpose: top app header with quick search, notifications, and profile actions. */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearSession } from '../../services/api'

function initialsFromName(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  return (parts[0]?.[0] || 'A') + (parts[1]?.[0] || (parts[0]?.[1] || 'F'))
}

export default function Header({
  title = 'Dashboard',
  subtitle = 'Beautiful clarity for every money decision.',
  onMenuClick,
  onSearch,
  profile,
  notifications = [],
}) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const menuRef = useRef(null)
  const bellRef = useRef(null)
  const unreadCount = useMemo(() => notifications.filter((item) => item.unread !== false).length, [notifications])
  const avatar = initialsFromName(profile?.name || 'Guest')

  useEffect(() => {
    const handleDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false)
      if (bellRef.current && !bellRef.current.contains(event.target)) setBellOpen(false)
    }
    document.addEventListener('mousedown', handleDown)
    return () => document.removeEventListener('mousedown', handleDown)
  }, [])

  const go = (path) => {
    setMenuOpen(false)
    setBellOpen(false)
    navigate(path)
  }

  const logout = () => {
    clearSession()
    setMenuOpen(false)
    navigate('/login', { replace: true })
  }

  return (
    <header className='sticky top-0 z-30 border-b border-border/70 bg-bg/80 px-4 py-3 backdrop-blur-xl md:px-6'>
      <div className='flex items-center gap-3'>
        {onMenuClick ? (
          <button type='button' onClick={onMenuClick} className='rounded-2xl border border-border bg-card/70 p-3 hover:bg-muted/20 md:hidden' aria-label='Open sidebar'>
            ☰
          </button>
        ) : null}
        <div className='flex-1'>
          <p className='text-xl font-semibold text-foreground'>{title}</p>
          <p className='text-sm text-muted'>{subtitle}</p>
        </div>

        {onSearch ? (
          <label className='hidden w-full max-w-sm items-center gap-2 rounded-2xl border border-border bg-card/70 px-4 py-3 md:flex'>
            <span className='text-muted'>⌕</span>
            <input
              type='search'
              placeholder='Search transactions'
              className='w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none'
              onChange={(event) => onSearch(event.target.value)}
              aria-label='Quick filter'
            />
          </label>
        ) : null}

        <div className='relative' ref={bellRef}>
          <button
            type='button'
            onClick={() => setBellOpen((prev) => !prev)}
            className='relative rounded-2xl border border-border bg-card/70 p-3 hover:bg-muted/20'
            aria-label='Notifications'
          >
            🔔
            {unreadCount > 0 ? <span className='absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-danger' /> : null}
          </button>

          {bellOpen ? (
            <div className='absolute right-0 mt-2 w-80 rounded-3xl border border-border bg-card p-4 shadow-soft'>
              <div className='flex items-center justify-between'>
                <h3 className='text-base font-semibold'>Notifications</h3>
                <span className='text-xs text-muted'>{unreadCount} new</span>
              </div>
              <div className='mt-4 space-y-3'>
                {(notifications.length ? notifications : [{ title: 'All clear', body: 'You are caught up for now.', unread: false }]).map((item) => (
                  <article key={`${item.title}-${item.body}`} className='rounded-2xl border border-border bg-bg p-3 text-sm'>
                    <p className='font-semibold'>{item.title}</p>
                    <p className='mt-1 text-muted'>{item.body}</p>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className='relative' ref={menuRef}>
          <button
            type='button'
            onClick={() => setMenuOpen((prev) => !prev)}
            className='flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 font-semibold text-accent'
            aria-haspopup='menu'
            aria-label='User menu'
          >
            {avatar}
          </button>

          {menuOpen ? (
            <div className='absolute right-0 mt-2 w-64 rounded-3xl border border-border bg-card p-2 shadow-soft'>
              <div className='rounded-2xl bg-bg/80 p-4'>
                <p className='text-sm font-semibold'>{profile?.name || 'Guest'}</p>
                <p className='mt-1 text-xs text-muted'>{profile?.email || 'Sign in with Google to restore saved data'}</p>
              </div>
              <div className='mt-2 grid gap-1'>
                <button type='button' onClick={() => go('/profile')} className='rounded-2xl px-4 py-3 text-left text-sm hover:bg-muted/20'>Profile</button>
                <button type='button' onClick={() => go('/settings')} className='rounded-2xl px-4 py-3 text-left text-sm hover:bg-muted/20'>Appearance</button>
                <button type='button' onClick={() => go('/privacy')} className='rounded-2xl px-4 py-3 text-left text-sm hover:bg-muted/20'>Privacy Center</button>
                <button type='button' onClick={() => go('/coach')} className='rounded-2xl px-4 py-3 text-left text-sm hover:bg-muted/20'>AI Coach</button>
                <button type='button' onClick={logout} className='rounded-2xl px-4 py-3 text-left text-sm text-danger hover:bg-danger/10'>Logout</button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
