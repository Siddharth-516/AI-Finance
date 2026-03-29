/** Purpose: conversational AI coach interface with quick prompts and history. */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { chatCoach } from '../../services/api'

const QUICK_PROMPTS = [
  'What should I spend less on?',
  'How do I build a budget?',
  'Should I start SIP investing now?',
  'Is my food spend too high?',
]

function MessageBubble({ role, content, meta }) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-2xl border px-4 py-3 ${isUser ? 'border-accent/40 bg-accent/15' : 'border-border bg-card/80'}`}>
        <p className='whitespace-pre-wrap text-sm leading-6'>{content}</p>
        {meta ? <p className='mt-2 text-[11px] uppercase tracking-[0.18em] text-muted'>{meta}</p> : null}
      </div>
    </div>
  )
}

export default function CoachPanel({ compact = false, title = 'AI Coach', subtitle = 'Ask me anything about your money.' }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Ask me anything about your money. I can explain patterns, suggest a budget, or turn spending into a clear next step.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (messageText) => {
    const text = String(messageText || input).trim()
    if (!text || loading) return

    setError('')
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)

    try {
      const response = await chatCoach(text)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.reply || 'I do not have a reply right now.',
          meta: response.mode === 'ai' ? 'DeepSeek' : response.mode === 'fallback' ? 'Fallback' : 'Coach',
        },
      ])
    } catch (err) {
      setError('I could not reach the AI service right now. Please try again shortly.')
    } finally {
      setLoading(false)
    }
  }

  const containerClass = compact
    ? 'glass-card rounded-2xl border border-border p-4'
    : 'glass-card rounded-3xl border border-border p-5 md:p-6'

  const messageClass = compact ? 'max-h-[340px]' : 'max-h-[520px]'

  const promptList = useMemo(() => QUICK_PROMPTS, [])

  return (
    <section className={containerClass} data-testid='coach-panel'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h3 className='text-lg font-semibold'>{title}</h3>
          <p className='mt-1 text-sm text-muted'>{subtitle}</p>
        </div>
        <span className='rounded-full bg-accent/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent'>Live</span>
      </div>

      <div className={`mt-4 space-y-3 overflow-y-auto rounded-2xl border border-border bg-bg/40 p-3 ${messageClass}`}>
        {messages.map((message, index) => (
          <MessageBubble key={`${message.role}-${index}`} role={message.role} content={message.content} meta={message.meta} />
        ))}
        {loading ? (
          <div className='flex justify-start'>
            <div className='rounded-2xl border border-border bg-card/80 px-4 py-3 text-sm text-muted'>Thinking…</div>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <div className='mt-4 flex flex-wrap gap-2'>
        {promptList.map((prompt) => (
          <button
            key={prompt}
            type='button'
            onClick={() => send(prompt)}
            className='rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground hover:border-accent/40 hover:bg-muted/10'
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className='mt-4 flex gap-2'>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              send(input)
            }
          }}
          placeholder='Ask something like “How do I save ₹5,000 this month?”'
          className='min-w-0 flex-1 rounded-2xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40'
        />
        <button
          type='button'
          onClick={() => send(input)}
          className='rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-white disabled:opacity-60'
          disabled={loading}
        >
          Ask
        </button>
      </div>

      {error ? <p className='mt-3 text-sm text-danger'>{error}</p> : <p className='mt-3 text-xs text-muted'>Educational only — not financial advice.</p>}
    </section>
  )
}
