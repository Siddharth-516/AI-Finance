/** Purpose: API service helpers for dashboard and transaction flows. */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
})

const toIso = (date) => date.toISOString().slice(0, 10)

export async function getDashboardSummary() {
  const to = new Date()
  const from = new Date()
  from.setMonth(from.getMonth() - 3)

  const [insightsRes, transactionsRes] = await Promise.all([
    api.get('/api/v1/insights'),
    api.get('/api/v1/transactions', {
      params: {
        from_date: toIso(from),
        to: toIso(to),
      },
    }),
  ])

  return {
    insights: insightsRes.data?.items || [],
    transactions: transactionsRes.data || [],
  }
}

export async function getTransactions(params = {}) {
  const to = new Date()
  const from = new Date()
  from.setMonth(from.getMonth() - 1)

  const response = await api.get('/api/v1/transactions', {
    params: {
      from_date: toIso(from),
      to: toIso(to),
      page: params.page || 1,
      page_size: params.pageSize || 10,
      ...params,
    },
  })

  return response.data || []
}

export async function importSms(file) {
  const text = await file.text()
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean)

  const response = await api.post('/api/v1/transactions/import/sms', {
    items: lines,
    consent: true,
  })

  return response.data
}

export default api
