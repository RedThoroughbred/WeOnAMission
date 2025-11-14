import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './contexts/AuthContext'
import { TenantProvider } from './contexts/TenantContext'
import { ThemeProvider } from './contexts/ThemeContext'

// Public Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Home from './pages/Home'

// Parent Portal
import ParentDashboard from './pages/parent/ParentDashboard'
import Students from './pages/parent/Students'
import Payments from './pages/parent/Payments'
import Documents from './pages/parent/Documents'

// Admin Portal
import AdminPortal from './pages/AdminPortal'

// Redirect old URLs to new routes
function LocationRedirect() {
  const location = useLocation()

  useEffect(() => {
    const pathname = location.pathname

    // Redirect old vanilla JS routes to React routes
    if (pathname === '/index.html') {
      window.history.replaceState({}, '', '/home' + location.search)
      window.location.href = '/home' + location.search
    } else if (pathname === '/login.html') {
      window.history.replaceState({}, '', '/login' + location.search)
      window.location.href = '/login' + location.search
    } else if (pathname === '/parent-portal.html') {
      window.history.replaceState({}, '', '/parent' + location.search)
      window.location.href = '/parent' + location.search
    } else if (pathname === '/admin-portal.html') {
      window.history.replaceState({}, '', '/admin' + location.search)
      window.location.href = '/admin' + location.search
    }
  }, [location])

  return null
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TenantProvider>
            <Router>
              <LocationRedirect />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home />} />

                {/* Parent Portal Routes */}
                <Route path="/parent" element={<ParentDashboard />} />
                <Route path="/students" element={<Students />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/documents" element={<Documents />} />

                {/* Admin Portal Routes */}
                <Route path="/admin" element={<AdminPortal />} />

                {/* Catch all - show landing page */}
                <Route path="*" element={<Landing />} />
              </Routes>
            </Router>
          </TenantProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
