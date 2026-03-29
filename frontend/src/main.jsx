import React, { useEffect } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import { AuthProvider } from "./context/AuthContext"

// Pages
import Dashboard from "./pages/Dashboard"
import Transactions from "./pages/Transactions"
import Settings from "./pages/Settings"
import Profile from "./pages/Profile"
import Privacy from "./pages/Privacy"
import Coach from "./pages/Coach"
import LoginRegisterPage from "./pages/LoginRegisterPage"
import ProtectedRoute from "./components/ProtectedRoute"

import "./styles/tokens.css"

function AppRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode='wait'>
      <Routes location={location} key={location.pathname}>
        <Route path='/' element={<Navigate to='/login' />} />
        <Route path='/login' element={<LoginRegisterPage />} />
        <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path='/transactions' element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path='/coach' element={<ProtectedRoute><Coach /></ProtectedRoute>} />
        <Route path='/ai-coach' element={<ProtectedRoute><Coach /></ProtectedRoute>} />
        <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path='/settings' element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path='/privacy' element={<ProtectedRoute><Privacy /></ProtectedRoute>} />
        <Route
          path='*'
          element={
            <div style={{ color: 'white', padding: '20px' }}>
              404 Page Not Found
            </div>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

function AppRouter() {


  return (
    <BrowserRouter>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className='min-h-screen'

        style={{}}>
        <AppRoutes />
      </motion.div>
    </BrowserRouter>
  )
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </React.StrictMode>
)
