/** Purpose: app entry with auth-aware routes and global tokens. */
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Transactions from './pages/Transactions'
import Settings from './pages/Settings'
import { loadAuthToken } from './services/api'
import './styles/tokens.css'

function PrivateRoute({ children }) {
  const token = loadAuthToken()
  return token ? children : <Navigate to='/login' replace />
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to='/dashboard' replace />} />
        <Route path='/login' element={<Login />} />
        <Route
          path='/dashboard'
          element={(
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          )}
        />
        <Route
          path='/transactions'
          element={(
            <PrivateRoute>
              <Transactions />
            </PrivateRoute>
          )}
        />
        <Route
          path='/settings'
          element={(
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          )}
        />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
)
