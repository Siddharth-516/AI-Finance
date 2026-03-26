/** Purpose: API service helpers for auth, expenses, insights, and chat flows. */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
})

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('aifc_token', token)
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    localStorage.removeItem('aifc_token')
    delete api.defaults.headers.common.Authorization
  }
}

export function loadAuthToken() {
  const token = localStorage.getItem('aifc_token')
  if (token) setAuthToken(token)
  return token
}

export async function googleLogin(payload) {
  const response = await api.post('/api/v1/auth/google', payload)
  return response.data
}

export async function getProfile() {
  const response = await api.get('/api/v1/user/me')
  return response.data
}

export async function addExpense(payload) {
  const response = await api.post('/api/v1/expenses', payload)
  return response.data
}

export async function getExpenses() {
  const response = await api.get('/api/v1/expenses')
  return response.data || []
}

export async function updateExpense(id, payload) {
  const response = await api.put(`/api/v1/expenses/${id}`, payload)
  return response.data
}

export async function deleteExpense(id) {
  const response = await api.delete(`/api/v1/expenses/${id}`)
  return response.data
}

export async function getInsights() {
  const response = await api.get('/api/v1/insights')
  return response.data?.items || []
}

export async function chatWithCoach(message) {
  const response = await api.post('/api/v1/chat', { message })
  return response.data
}

export async function getDashboardSummary() {
  const [insights, expenses] = await Promise.all([getInsights(), getExpenses()])
  return { insights, expenses }
}

export default api
