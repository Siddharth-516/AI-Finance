/** Purpose: top app header with quick search, notifications, and profile actions. */
import React from 'react'

export default function Header({ onMenuClick, onSearch, title = 'Dashboard' }) {
  return (
    <header className='sticky top-0 z-30 border-b border-border/70 bg-bg/80 px-4 py-3 backdrop-blur-xl md:px-6' data-testid='header'>
      <div className='flex items-center gap-3'>
        <button
          type='button'
          onClick={onMenuClick}
          className='rounded-lg p-2 text-muted hover:bg-muted/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent md:hidden'
          aria-label='Open sidebar'
        >
          ☰
        </button>

        <div className='flex-1'>
          <p className='text-xl font-semibold text-foreground'>{title}</p>
          <p className='text-sm text-muted'>Beautiful clarity for every money decision.</p>
        </div>

        <label className='hidden w-full max-w-xs items-center gap-2 rounded-xl border border-border bg-card/70 px-3 py-2 md:flex'>
          <span className='text-muted'>⌕</span>
          <input
            type='search'
            placeholder='Search transactions'
            className='w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none'
            onChange={(event) => onSearch(event.target.value)}
            aria-label='Quick filter'
          />
        </label>

        <button type='button' className='relative rounded-xl border border-border bg-card/70 p-2 hover:bg-muted/20' aria-label='Notifications'>
          🔔
          <span className='absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-danger' />
        </button>

        <div className='group relative'>
          <button
            type='button'
            className='flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 font-semibold text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent'
            aria-haspopup='menu'
            aria-label='User menu'
          >
            AF
          </button>
          <div className='invisible absolute right-0 mt-2 w-44 rounded-xl border border-border bg-card p-1 opacity-0 shadow-soft transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100'>
            <button type='button' className='block w-full rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted/30'>Profile</button>
            <button type='button' className='block w-full rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted/30'>Privacy Center</button>
            <button type='button' className='block w-full rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-danger/10'>Logout</button>
          </div>
        </div>
      </div>
    </header>
  )
}
