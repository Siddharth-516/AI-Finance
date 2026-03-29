const API_BASE = import.meta.env.VITE_API_BASE || ''

const LOCAL_KEYS = {
  token: 'aifc_access_token',
  refreshToken: 'aifc_refresh_token',
  authMode: 'aifc_auth_mode',
  guestExpenses: 'aifc_guest_expenses',
  guestTransactions: 'aifc_guest_transactions',
  profileCache: 'aifc_profile_cache',
}

const DEFAULT_PROFILE = {
  name: 'Guest',
  email: 'guest@example.com',
  mode: 'guest',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  income_range: '0-25000',
  risk_level: 'low',
}

function readJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key) || sessionStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeJson(key, value, remember = true) {
  const raw = JSON.stringify(value)
  if (remember) {
    localStorage.setItem(key, raw)
  } else {
    sessionStorage.setItem(key, raw)
  }
}

function removeJson(key) {
  localStorage.removeItem(key)
  sessionStorage.removeItem(key)
}

function getAuthMode() {
  return localStorage.getItem(LOCAL_KEYS.authMode) || sessionStorage.getItem(LOCAL_KEYS.authMode) || null
}

function setAuthMode(mode, remember = true) {
  localStorage.removeItem(LOCAL_KEYS.authMode)
  sessionStorage.removeItem(LOCAL_KEYS.authMode)

  if (!mode) return

  if (mode === 'guest') {
    sessionStorage.setItem(LOCAL_KEYS.authMode, mode)
    return
  }

  if (remember) {
    localStorage.setItem(LOCAL_KEYS.authMode, mode)
  } else {
    sessionStorage.setItem(LOCAL_KEYS.authMode, mode)
  }
}

function clearAuthMode() {
  localStorage.removeItem(LOCAL_KEYS.authMode)
  sessionStorage.removeItem(LOCAL_KEYS.authMode)
}

function getGuestData(key) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function setGuestData(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage errors
  }
}

function authHeaders() {
  const authMode = getAuthMode()
  if (authMode !== 'user') return {}
  const token = loadAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`
  const init = {
    ...options,
    headers: {
      ...options.headers,
      ...authHeaders(),
    },
  }

  const response = await fetch(url, init)
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    const error = new Error(`API request failed ${response.status}: ${text || response.statusText}`)
    error.status = response.status
    throw error
  }

  if (response.status === 204) return null

  return response.json()
}


function guessCategory(text) {
  const t = (text || '').toLowerCase()
  if (t.includes('swiggy') || t.includes('zomato') || t.includes('food')) return 'food_dining'
  if (t.includes('uber') || t.includes('ola') || t.includes('taxi') || t.includes('transport')) return 'transport'
  if (t.includes('rent')) return 'rent'
  if (t.includes('edu') || t.includes('education')) return 'education'
  return 'others'
}

function parseAmount(text) {
  if (!text) return null
  const amounts = [...text.matchAll(/(?:₹|Rs\.?\s*|INR\s*)([0-9]+(?:[.,][0-9]{1,2})?)/gi)]
  if (amounts.length) {
    const cleaned = amounts[0][1].replace(',', '')
    const value = Number.parseFloat(cleaned)
    return Number.isFinite(value) ? value : null
  }
  const fallback = [...text.matchAll(/([0-9]+(?:[.,][0-9]{1,2})?)/g)]
  if (fallback.length) {
    const cleaned = fallback[0][1].replace(',', '')
    const value = Number.parseFloat(cleaned)
    return Number.isFinite(value) ? value : null
  }
  return null
}

function parseMerchant(text) {
  if (!text) return 'Unknown'
  const lowered = text.toLowerCase()
  const known = ['Swiggy', 'Zomato', 'Uber', 'Ola', 'Flipkart', 'Amazon', 'BigBasket', 'Dominos', 'McDonald']
  for (const m of known) {
    if (lowered.includes(m.toLowerCase())) return m
  }

  // Rent-related fallback for missing explicit merchant
  if (lowered.includes('rent') || lowered.includes('house') || lowered.includes('emi')) {
    const hasMerchantLike = /\b(at|from|by)\s+([A-Za-z0-9 &\-]+)/i.test(text)
    if (!hasMerchantLike) return 'Landlord'
  }

  const match = text.match(/at\s+([A-Za-z0-9 &\-]+)/i)
  if (match) return match[1].trim()

  const candidate = text.split(/\s+/).slice(0, 3).join(' ').slice(0, 20)
  return candidate || 'Unknown'
}

function ensureAppState() {
  if (getAuthMode() === 'guest') {
    if (!Array.isArray(readJson(LOCAL_KEYS.guestExpenses))) {
      writeJson(LOCAL_KEYS.guestExpenses, [])
    }
    if (!Array.isArray(readJson(LOCAL_KEYS.guestTransactions))) {
      writeJson(LOCAL_KEYS.guestTransactions, [])
    }
  }
}

export function loadAuthToken() {
  if (getAuthMode() !== 'user') return null
  return sessionStorage.getItem(LOCAL_KEYS.token) || localStorage.getItem(LOCAL_KEYS.token)
}

export function setAuthToken(token, remember = true) {
  sessionStorage.removeItem(LOCAL_KEYS.token)
  localStorage.removeItem(LOCAL_KEYS.token)

  if (!token) return

  if (remember) {
    localStorage.setItem(LOCAL_KEYS.token, token)
  } else {
    sessionStorage.setItem(LOCAL_KEYS.token, token)
  }
}

export function saveAuth(access_token, refresh_token, remember = true) {
  if (!access_token) {
    throw new Error('Invalid auth token')
  }

  setAuthMode('user', remember)
  setAuthToken(access_token, remember)

  if (refresh_token) {
    if (remember) {
      localStorage.setItem(LOCAL_KEYS.refreshToken, refresh_token)
    } else {
      sessionStorage.setItem(LOCAL_KEYS.refreshToken, refresh_token)
    }
  }
}

export function clearSession() {
  localStorage.removeItem(LOCAL_KEYS.token)
  sessionStorage.removeItem(LOCAL_KEYS.token)
  localStorage.removeItem(LOCAL_KEYS.refreshToken)
  sessionStorage.removeItem(LOCAL_KEYS.refreshToken)
  localStorage.removeItem(LOCAL_KEYS.profileCache)
  sessionStorage.removeItem(LOCAL_KEYS.profileCache)
  sessionStorage.removeItem(LOCAL_KEYS.guestExpenses)
  sessionStorage.removeItem(LOCAL_KEYS.guestTransactions)
  clearAuthMode()
  window.__guestModeActive = false
}

export function clearAuth() {
  clearSession()
}

export async function startGuestSession(remember = true) {
  clearSession()
  setAuthMode('guest')
  window.__guestModeActive = true
  ensureAppState()

  return { ...DEFAULT_PROFILE, mode: 'guest' }
}

export async function googleLogin(id_token, remember = true) {
  if (typeof id_token === 'string' && id_token.trim().length > 0) {
    const response = await apiFetch('/api/v1/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token }),
    })

    saveAuth(response.token || '', response.refresh_token || '', remember)
    const profile = await getCurrentUser()

    return { access_token: response.token, refresh_token: response.refresh_token, user: profile }
  }

  return startGuestSession(remember)
}

export async function loginGoogle(payload) {
  if (payload && typeof payload === 'object') {
    if (payload.id_token) {
      return googleLogin(payload.id_token, payload.remember !== false)
    }
    if (payload.mode === 'guest') {
      return startGuestSession(payload.remember !== false)
    }
  }

  return googleLogin(null, true)
}

export async function getCurrentUser() {
  ensureAppState()

  const mode = getAuthMode()

  if (mode === 'user') {
    const token = loadAuthToken()
    if (!token) {
      clearAuth()
      return null
    }

    try {
      const backend = await apiFetch('/api/v1/user/me')
      const profile = {
        ...DEFAULT_PROFILE,
        name: backend.name || DEFAULT_PROFILE.name,
        email: backend.email || DEFAULT_PROFILE.email,
        timezone: backend.timezone || DEFAULT_PROFILE.timezone,
        currency: backend.currency || DEFAULT_PROFILE.currency,
        income_range: backend.income_range || DEFAULT_PROFILE.income_range,
        risk_level: backend.risk_level || DEFAULT_PROFILE.risk_level,
        mode: 'user',
        fallback: false,
      }
      writeJson(LOCAL_KEYS.profileCache, profile, true)
      return profile
    } catch (error) {
      if (error?.status === 401) {
        clearAuth()
        return null
      }

      const cache = readJson(LOCAL_KEYS.profileCache, null)
      if (cache) {
        return { ...cache, mode: 'user', fallback: true }
      }
      clearAuth()
      return null
    }
  }

  if (mode === 'guest') {
    if (!window.__guestModeActive) {
      clearSession()
      return null
    }
    return { ...DEFAULT_PROFILE, mode: 'guest' }
  }

  return null
}

export async function getProfile() {
  return getCurrentUser()
}

export async function updateProfile(payload) {
  const mode = getAuthMode()

  if (mode === 'user') {
    const response = await apiFetch('/api/v1/user/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const profile = { ...DEFAULT_PROFILE, ...response, mode: 'user' }
    writeJson(LOCAL_KEYS.profileCache, profile, true)
    return profile
  }

  if (mode === 'guest') {
    const cache = { ...DEFAULT_PROFILE, ...payload, mode: 'guest' }
    writeJson(LOCAL_KEYS.profileCache, cache, true)
    return cache
  }

  throw new Error('Not authenticated')
}

export async function addExpense(data) {
  const mode = getAuthMode()
  if (mode === 'user') {
    try {
      const res = await apiFetch('/api/v1/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: data.amount, category: data.category, date: data.date, description: data.description }),
      })
      return res
    } catch {
      // fallback local for offline/dev
    }
  }

  if (mode === 'guest') {
    const expenses = getGuestData(LOCAL_KEYS.guestExpenses)
    const next = {
      ...data,
      id: (window.crypto?.randomUUID && window.crypto.randomUUID()) || `${Date.now()}-${Math.random()}`,
    }
    expenses.unshift(next)
    setGuestData(LOCAL_KEYS.guestExpenses, expenses)
    return next
  }

  return []
}

export async function getExpenses() {
  const mode = getAuthMode()
  if (mode === 'user') {
    try {
      const rows = await apiFetch('/api/v1/expenses')
      return rows.map((entry) => ({
        ...entry,
        id: entry.id,
        amount: Number(entry.amount || 0),
        category: entry.category || 'others',
        date: entry.date || entry.expense_date,
        description: entry.description || '',
      }))
    } catch {
      // offline/dev fallback
    }
  }

  if (mode === 'guest') {
    return getGuestData(LOCAL_KEYS.guestExpenses)
  }

  return []
}

export async function deleteExpense(id) {
  const mode = getAuthMode()
  if (mode === 'user') {
    try {
      await apiFetch(`/api/v1/expenses/${id}`, { method: 'DELETE' })
      return true
    } catch {
      // offline/dev fallback
    }
  }

  if (mode === 'guest') {
    const expenses = getGuestData(LOCAL_KEYS.guestExpenses).filter((item) => item.id !== id)
    setGuestData(LOCAL_KEYS.guestExpenses, expenses)
    return true
  }

  return false
}

export async function createTransaction(payload) {
  const mode = getAuthMode()

  const txn = {
    ...payload,
    id: (window.crypto?.randomUUID && window.crypto.randomUUID()) || `${Date.now()}-${Math.random()}`,
  }

  if (mode === 'guest') {
    const transactions = getGuestData(LOCAL_KEYS.guestTransactions)
    transactions.unshift(txn)
    setGuestData(LOCAL_KEYS.guestTransactions, transactions)
  }

  await addExpense({
    amount: Number(payload.amount) || 0,
    category: payload.category || guessCategory(payload.merchant),
    date: payload.txn_date || new Date().toISOString().slice(0, 10),
    description: payload.merchant || payload.notes || 'Manual entry',
  })

  return txn
}

export async function getTransactions() {
  const mode = getAuthMode()
  if (mode === 'guest') {
    return getGuestData(LOCAL_KEYS.guestTransactions)
  }

  // non-guest transaction endpoint is not available; using fallback cache for offline/dev
  return readJson(LOCAL_KEYS.guestTransactions, [])
}

export async function importSms(lines, consent = true) {
  if (!consent) {
    throw new Error('Explicit consent is required before parsing SMS')
  }

  const mode = getAuthMode()
  if (mode !== 'guest') {
    throw new Error('SMS import is only available in guest mode for isolated local usage')
  }

  const transactions = getGuestData(LOCAL_KEYS.guestTransactions)
  const expenses = getGuestData(LOCAL_KEYS.guestExpenses)
  let saved = 0

  const parsed = lines.map((line) => {
    const amount = parseAmount(line)
    const merchant = parseMerchant(line)
    const category = guessCategory(line)
    const txn_date = new Date().toISOString().slice(0, 10)
    return { raw_text: line, amount, merchant, category, txn_date }
  })

  parsed.forEach((item) => {
    if (!item.amount || item.amount <= 0) return
    const id = (window.crypto?.randomUUID && window.crypto.randomUUID()) || `${Date.now()}-${Math.random()}`
    transactions.unshift({ ...item, id })
    expenses.unshift({ id, amount: item.amount, category: item.category, date: item.txn_date, description: item.merchant || 'SMS import' })
    saved += 1
  })

  setGuestData(LOCAL_KEYS.guestTransactions, transactions)
  setGuestData(LOCAL_KEYS.guestExpenses, expenses)

  return { preview: parsed, count: parsed.length, saved }
}

export async function getDashboardSummary() {
  ensureAppState()
  const expenses = await getExpenses()
  const insights = await getInsights()
  return { expenses: Array.isArray(expenses) ? expenses : [], insights: insights.items || [] }
}

export async function getInsights() {
  ensureAppState()
  const expenses = await getExpenses()
  const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
  const byCategory = expenses.reduce((acc, e) => {
    const cat = e.category || 'others'
    acc[cat] = (acc[cat] || 0) + Number(e.amount || 0)
    return acc
  }, {})

  const items = []
  if (total > 0) {
    items.push(`You spent ₹${total.toFixed(2)} so far.`)
    const top = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]
    if (top) {
      items.push(`Top spending is ${top[0]} with ₹${top[1].toFixed(2)}.`)
    }
  } else {
    items.push('No expense data yet. Add your first transaction.')
  }

  return { items }
}

export async function getRecommendations() {
  ensureAppState()
  const profile = await getProfile()
  const risk = profile.risk_level || 'low'
  const plan = [
    'Set up a ?500 weekly food limit and track it every Sunday.',
    'Check your recurring subscriptions and cancel one you rarely use.',
  ]
  if (risk === 'high') {
    plan.unshift('Your profile says high risk, keep emergency savings of 6 months first.')
  }
  return { plan }
}

export async function chatWithCoach(message, conversation_history = []) {
  ensureAppState()
  const profile = await getProfile()
  const expenses = await getExpenses()

  const summary = {
    total_spend: expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    top_categories: Object.entries(
      expenses.reduce((acc, e) => {
        const c = e.category || 'others'
        acc[c] = (acc[c] || 0) + Number(e.amount || 0)
        return acc
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
  }

  const payload = { message, conversation_history }
  try {
    const base = import.meta.env.VITE_API_BASE || ''
    const response = await fetch(`${base}/api/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      const data = await response.json()
      if (data?.reply) {
        return { reply: data.reply, mode: data.mode || 'ai', sources: data.sources || [] }
      }
    }
  } catch (err) {
    // continue to fallback without crashing
  }

  // Fallback: dynamic heuristic on local data
  const total = summary.total_spend
  const topCategory = summary.top_categories[0]?.[0] || 'none'
  const topAmount = Number(summary.top_categories[0]?.[1] || 0)

  const answers = []
  answers.push(`Your total spending is ₹${total.toFixed(2)}.`)
  if (topAmount > 0) {
    answers.push(`Top category: ${topCategory} with ₹${topAmount.toFixed(2)}.`)
  }

  let actionLine = ''
  if (/overspend|too high|top category|where/i.test(message)) {
    answers.push(`Looks like ${topCategory} is the biggest pressure point. Cutting just 10% there could free up ₹${(topAmount * 0.1).toFixed(2)}.`)
    actionLine = `👉 Action: Reduce ${topCategory} by ₹${(topAmount * 0.1).toFixed(2)} this week.`
  } else if (/save|budget|reduce|cut/i.test(message)) {
    answers.push('Target one habit change—fewer dine-outs and one subscription removal this month.')
    answers.push(`Based on ₹${total.toFixed(2)} spend, aim to save 5% (₹${(total * 0.05).toFixed(2)}).`)
    actionLine = `👉 Action: Move ₹${(total * 0.05).toFixed(2)} to savings today.`
  } else if (/invest|sip|return/i.test(message)) {
    answers.push('Build an emergency buffer first, then automate 5-10% into a SIP plan once cash flow is stable.')
    actionLine = `👉 Action: Start a SIP with ₹${(total * 0.03).toFixed(2)} when your emergency fund hits 3x monthly expenses.`
  } else {
    answers.push('Watch your biggest category and set a weekly cap for it; adjust as you log more expenses.')
    actionLine = `👉 Action: Trim top category ${topCategory} by ₹${(total * 0.05).toFixed(2)} this week.`
  }

  answers.push(actionLine)

  if (profile?.risk_level || profile?.income_range) {
    answers.push(`Your profile (${profile?.risk_level || 'unknown'} risk, ${profile?.income_range || 'unknown'} income) helps guide practical next steps.`)
  }

  answers.push('Educational only — not financial advice.')

  return { reply: answers.join(' '), mode: 'fallback', sources: ['client heuristic'] }
}

export async function chatCoach(message) {
  return chatWithCoach(message)
}

export async function exportData() {
  ensureAppState()
  return {
    profile: await getProfile(),
    expenses: await getExpenses(),
    transactions: await getTransactions(),
  }
}

export async function deleteAccount() {
  clearSession()
  return true
}
