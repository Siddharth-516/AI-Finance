/** Purpose: full AI coach surface with chat history, quick prompts, and live replies. */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import classNames from 'classnames'
import { chatCoach } from '../../services/api'

const DEFAULT_PROMPTS = [
  'Where am I overspending?',
  'How should I save this month?',
  'Can I start investing now?',
  'Is my food spend too high?',
]

function makeMessage(role, content) {
  return { id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`, role, content }
}

export default function CoachPanel({ compact = false, title = 'AI Coach', subtitle = 'Ask about spending, budgets, goals, or investing basics.', prompts = DEFAULT_PROMPTS }) {
  const [messages, setMessages] = useState([
    makeMessage('assistant', 'Ask me anything about your money. I can explain patterns, suggest a budget, or turn spending into a clear next step.'),
  ])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, sending])

  const canSend = useMemo(() => draft.trim().length > 0 && !sending, [draft, sending])

  const sendPrompt = async (text) => {
    const prompt = text.trim()
    if (!prompt) return

    setError('')
    setDraft('')
    setSending(true)
    setMessages((prev) => [...prev, makeMessage('user', prompt)])

    try {
      const response = await chatCoach(prompt)
      const reply = typeof response === 'string' ? response : response?.reply || 'I could not generate a reply right now.'
      setMessages((prev) => [...prev, makeMessage('assistant', reply)])
    } catch (err) {
      setError('AI is unavailable at the moment. Try again in a bit.')
      setMessages((prev) => [...prev, makeMessage('assistant', 'I could not reach the AI service right now. Please try again shortly.')])
    } finally {
      setSending(false)
    }
  }

  return (
    <section className={classNames('glass-card rounded-2xl border border-border p-5', compact ? 'shadow-soft' : 'shadow-lg')} data-testid='coach-panel'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h3 className='text-lg font-semibold'>{title}</h3>
          <p className='mt-1 text-sm text-muted'>{subtitle}</p>
        </div>
        <span className='rounded-full bg-accent/15 px-2 py-1 text-xs font-semibold text-accent'>Live</span>
      </div>

      <div className={classNames('mt-4 space-y-3 overflow-y-auto pr-1', compact ? 'max-h-72' : 'max-h-[32rem]')}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={classNames(
              'max-w-[92%] rounded-2xl border px-4 py-3 text-sm leading-6',
              message.role === 'assistant'
                ? 'border-border bg-card/80 text-foreground'
                : 'ml-auto border-accent/30 bg-accent/10 text-foreground'
            )}
          >
            {message.content}
          </div>
        ))}
        {sending ? <div className='max-w-[92%] rounded-2xl border border-border bg-card/70 px-4 py-3 text-sm text-muted'>Thinking...</div> : null}
        <div ref={endRef} />
      </div>

      <div className='mt-4 flex flex-wrap gap-2'>
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type='button'
            onClick={() => sendPrompt(prompt)}
            className='rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition hover:bg-muted/20'
            disabled={sending}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className='mt-4 flex gap-2'>
        <input
          type='text'
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              sendPrompt(draft)
            }
          }}
          placeholder='Ask something like “How do I save ₹5,000 this month?”'
          className='min-w-0 flex-1 rounded-xl border border-border bg-card px-3 py-3 text-sm outline-none ring-0 transition placeholder:text-muted focus:border-accent/50 focus:ring-2 focus:ring-accent/20'
        />
        <button
          type='button'
          onClick={() => sendPrompt(draft)}
          disabled={!canSend}
          className='rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60'
        >
          {sending ? '...' : 'Ask'}
        </button>
      </div>

      {error ? <p className='mt-3 text-xs text-danger'>{error}</p> : <p className='mt-3 text-xs text-muted'>Educational only — not financial advice.</p>}
    </section>
  )
}
