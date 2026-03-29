import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

// Pages
import Dashboard from "./pages/Dashboard"
import Transactions from "./pages/Transactions"
import Profile from "./pages/Profile"
import Settings from "./pages/Settings"
import Privacy from "./pages/Privacy"
import Coach from "./pages/Coach"
import ProtectedRoute from "./components/ProtectedRoute"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Navigate to="/dashboard" />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/coach" element={<ProtectedRoute><Coach /></ProtectedRoute>} />
        <Route path="/ai-coach" element={<ProtectedRoute><Coach /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/privacy" element={<ProtectedRoute><Privacy /></ProtectedRoute>} />

        <Route path="*" element={<div style={{ color: "white", padding: "20px" }}>404 Page Not Found</div>} />

      </Routes>
    </BrowserRouter>
  )
}