/** Purpose: dedicated AI coach page with a chat-first interface. */
import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from '../components/Layout/Header'
import Sidebar from '../components/Layout/Sidebar'
import BottomNav from '../components/Layout/BottomNav'
import { chatWithCoach, getProfile, getExpenses } from '../services/api'

const quickPrompts = [
  'What should I spend less on?',
  'How do I build a budget?',
  'Should I start SIP investing now?',
  'Is my food spend too high?',
]

export default function Coach() {
  const { loading: authLoading, fallbackStatus } = useAuth()
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const storedProfile = null
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hello User 👋 How can I help you today?`,
    },
    {
      role: 'assistant',
      text: 'I can analyze your spending, suggest savings, or help you invest.',
    },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [conversationHistory, setConversationHistory] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (authLoading) return
    Promise.all([getProfile(), getExpenses()])
      .then(([user, expenses]) => {
        setProfile(user)
        if (expenses.length) {
          const total = expenses.reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0
          )
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              text: `I can see ₹${total.toLocaleString()} in recorded expenses. Ask me where the pressure is building or what to cut first.`,
            },
          ])
        }
      })
      .catch(() => {
        navigate('/dashboard', { replace: true })
      })
  }, [navigate])

  if (authLoading) {
    return (
      <div className='flex h-screen items-center justify-center text-white'>
        <div>Loading session and profile...</div>
      </div>
    )
  }

  const notifications = useMemo(
    () => [{ title: 'Money coach live', body: 'Use questions to turn spending into actions.', unread: true }],
    []
  )

  const sendMessage = async (question) => {
    const text = (question || input).trim()
    if (!text || busy) return

    setBusy(true)
    setMessages((prev) => [
      ...prev,
      { role: 'user', text },
      { role: 'assistant', text: 'Analyzing your spending...' },
    ])
    const userHistory = [...conversationHistory, { role: 'user', content: text }].slice(-3)
    setConversationHistory(userHistory)
    setInput('')

    try {
      const res = await chatWithCoach(text, userHistory)
      const finalReply = res.reply || 'No reply received.'
      let progress = 0

      const interval = setInterval(() => {
        setMessages((prev) => {
          const next = [...prev]
          const last = next[next.length - 1]
          if (!last || last.role !== 'assistant') return next

          const displayText = finalReply.slice(0, progress)
          next[next.length - 1] = { role: 'assistant', text: displayText }
          return next
        })

        progress += 2
        if (progress >= finalReply.length) {
          clearInterval(interval)
          setMessages((prev) => {
            const next = [...prev]
            const last = next[next.length - 1]
            if (!last || last.role !== 'assistant') return next
            next[next.length - 1] = { role: 'assistant', text: finalReply }
            return next
          })
        }
      }, 16)

      setConversationHistory((prev) => [
        ...(prev || []),
        { role: 'assistant', content: finalReply },
      ].slice(-3))
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            err?.response?.data?.detail ||
            'I could not reach the AI service right now. Try again shortly.',
        },
      ])
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div
      className='min-h-screen bg-bg text-foreground'
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3 }}
    >
      <div className='flex'>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
        <div className='flex min-h-screen flex-1 flex-col'>
          <Header
            title='Money coach'
            subtitle='Ask anything in simple language. The answer adapts to your profile and spending patterns.'
            profile={profile}
            notifications={notifications}
            onMenuClick={() => setSidebarOpen(true)}
          />

          {fallbackStatus && (
            <div className='mx-6 mb-2 rounded-lg border border-amber-200/30 bg-amber-200/10 px-4 py-2 text-sm text-amber-100'>
              {fallbackStatus}
            </div>
          )}

          <main className='space-y-4 p-4 pb-24 md:p-6'>
            <section className='rounded-3xl border border-border bg-card p-5 shadow-soft'>
              <div className='flex items-center justify-between gap-3'>
                <div>
                  <h2 className='text-2xl font-semibold'>Ask me anything</h2>
                  <p className='text-sm text-muted'>
                    Use the coach for spending questions, savings prompts, and simple investing education.
                  </p>
                </div>
                <span className='rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent'>
                  LIVE
                </span>
              </div>

              <div className='mt-5 space-y-4 rounded-3xl border border-border bg-bg p-4'>
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`max-w-3xl rounded-3xl border px-4 py-4 text-sm leading-6 ${
                      message.role === 'user'
                        ? 'ml-auto border-accent/40 bg-accent/15'
                        : 'border-border bg-card/80'
                    }`}
                  >
                    <p className='whitespace-pre-wrap'>{message.text}</p>
                  </div>
                ))}
              </div>

              <div className='mt-5 flex flex-wrap gap-2'>
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type='button'
                    onClick={() => sendMessage(prompt)}
                    className='rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-muted/20'
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  sendMessage()
                }}
                className='mt-5 flex gap-2'
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder='Ask something like “How do I save ₹5,000 this month?”'
                  className='flex-1 rounded-2xl border border-border bg-bg px-4 py-3 text-sm'
                />
                <button
                  type='submit'
                  className='rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-white'
                  disabled={busy}
                >
                  {busy ? 'Analyzing your spending...' : 'Ask'}
                </button>
              </form>

              <p className='mt-4 text-center text-xs text-muted/70'>
                Educational only — not financial advice.
              </p>
            </section>
          </main>
        </div>
      </div>
      <BottomNav />
    </motion.div>
  )
}