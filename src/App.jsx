import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './contexts/AuthContext'
import { TenantProvider } from './contexts/TenantContext'
import { ThemeProvider } from './contexts/ThemeContext'

// Pages (will be created)
import Landing from './pages/Landing'
import Login from './pages/Login'
import Home from './pages/Home'
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
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/home" element={<Home />} />
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
