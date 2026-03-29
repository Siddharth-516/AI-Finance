/** Purpose: reusable app shell with sidebar, header, and mobile nav. */
import React, { useEffect, useState } from 'react'
import AnimatedBackdrop from '../FX/AnimatedBackdrop'
import BottomNav from './BottomNav'
import Header from './Header'
import Sidebar from './Sidebar'
import { getNotifications } from '../../services/api'

const FALLBACK_NOTIFICATIONS = [
  { title: 'Demo mode active', body: 'Sign in with Google to restore your saved account data.', kind: 'info', href: '/login' },
  { title: 'Privacy center', body: 'Export data or delete your account from the privacy page.', kind: 'warning', href: '/privacy' },
]

export default function AppShell({
  title,
  subtitle,
  children,
  onSearch,
  searchPlaceholder,
  showSearch = true,
  className = '',
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState(FALLBACK_NOTIFICATIONS)

  useEffect(() => {
    let active = true
    getNotifications()
      .then((items) => {
        if (active && Array.isArray(items) && items.length) {
          setNotifications(items)
        }
      })
      .catch(() => {
        if (active) setNotifications(FALLBACK_NOTIFICATIONS)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <div className='min-h-screen bg-bg text-foreground'>
      <div className='flex'>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        <div className='relative flex min-h-screen flex-1 flex-col overflow-hidden'>
          <AnimatedBackdrop />
          <Header
            title={title}
            subtitle={subtitle}
            onMenuClick={() => setIsSidebarOpen(true)}
            onSearch={onSearch}
            searchPlaceholder={searchPlaceholder}
            showSearch={showSearch}
            notifications={notifications}
          />

          <main className={`relative z-10 space-y-6 p-4 pb-24 md:p-6 ${className}`}>
            {children}
          </main>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
