import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './contexts/AuthContext'
import { TenantProvider } from './contexts/TenantContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Public Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Home from './pages/Home'

// Parent Portal
import ParentDashboard from './pages/parent/ParentDashboard'
import Students from './pages/parent/Students'
import Payments from './pages/parent/Payments'
import Documents from './pages/parent/Documents'
import ParentEvents from './pages/parent/Events'
import ParentResources from './pages/parent/Resources'

// Student Portal
import StudentDashboard from './pages/student/StudentDashboard'
import TripMemories from './pages/student/TripMemories'
import StudentEvents from './pages/student/Events'
import StudentResources from './pages/student/Resources'

// Admin Portal
import AdminPortal from './pages/AdminPortal'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminStudents from './pages/admin/AdminStudents'
import AdminParents from './pages/admin/AdminParents'
import AdminPayments from './pages/admin/AdminPayments'
import AdminDocuments from './pages/admin/AdminDocuments'
import AdminEvents from './pages/admin/AdminEvents'
import AdminResources from './pages/admin/AdminResources'
import AdminMemories from './pages/admin/AdminMemories'
import AdminQuestions from './pages/admin/AdminQuestions'
import AdminSettings from './pages/admin/AdminSettings'
import AdminUsers from './pages/admin/AdminUsers'
import ContentManagement from './pages/admin/ContentManagement'

// Super Admin Portal
import SuperAdmin from './pages/SuperAdmin'
import SuperAdminChurches from './pages/superadmin/Churches'
import SuperAdminUsers from './pages/superadmin/Users'
import SuperAdminSettings from './pages/superadmin/Settings'

// Shared Pages
import Faq from './pages/shared/Faq'
import MyQuestions from './pages/shared/MyQuestions'

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
    } else if (pathname === '/student-portal.html') {
      window.history.replaceState({}, '', '/student' + location.search)
      window.location.href = '/student' + location.search
    } else if (pathname === '/admin-portal.html') {
      window.history.replaceState({}, '', '/admin' + location.search)
      window.location.href = '/admin' + location.search
    } else if (pathname === '/super-admin-portal.html') {
      window.history.replaceState({}, '', '/super-admin' + location.search)
      window.location.href = '/super-admin' + location.search
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
                <Route path="/parent" element={<ProtectedRoute requiredRole="parent"><ParentDashboard /></ProtectedRoute>} />
                <Route path="/parent/students" element={<ProtectedRoute requiredRole="parent"><Students /></ProtectedRoute>} />
                <Route path="/parent/payments" element={<ProtectedRoute requiredRole="parent"><Payments /></ProtectedRoute>} />
                <Route path="/parent/documents" element={<ProtectedRoute requiredRole="parent"><Documents /></ProtectedRoute>} />
                <Route path="/parent/events" element={<ProtectedRoute requiredRole="parent"><ParentEvents /></ProtectedRoute>} />
                <Route path="/parent/resources" element={<ProtectedRoute requiredRole="parent"><ParentResources /></ProtectedRoute>} />
                <Route path="/parent/questions" element={<ProtectedRoute requiredRole="parent"><MyQuestions /></ProtectedRoute>} />
                <Route path="/parent/faq" element={<ProtectedRoute requiredRole="parent"><Faq /></ProtectedRoute>} />

                {/* Student Portal Routes */}
                <Route path="/student" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
                <Route path="/student/memories" element={<ProtectedRoute requiredRole="student"><TripMemories /></ProtectedRoute>} />
                <Route path="/student/events" element={<ProtectedRoute requiredRole="student"><StudentEvents /></ProtectedRoute>} />
                <Route path="/student/resources" element={<ProtectedRoute requiredRole="student"><StudentResources /></ProtectedRoute>} />
                <Route path="/student/questions" element={<ProtectedRoute requiredRole="student"><MyQuestions /></ProtectedRoute>} />
                <Route path="/student/faq" element={<ProtectedRoute requiredRole="student"><Faq /></ProtectedRoute>} />

                {/* Admin Portal Routes */}
                <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPortal /></ProtectedRoute>} />
                <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/students" element={<ProtectedRoute requiredRole="admin"><AdminStudents /></ProtectedRoute>} />
                <Route path="/admin/parents" element={<ProtectedRoute requiredRole="admin"><AdminParents /></ProtectedRoute>} />
                <Route path="/admin/payments" element={<ProtectedRoute requiredRole="admin"><AdminPayments /></ProtectedRoute>} />
                <Route path="/admin/documents" element={<ProtectedRoute requiredRole="admin"><AdminDocuments /></ProtectedRoute>} />
                <Route path="/admin/events" element={<ProtectedRoute requiredRole="admin"><AdminEvents /></ProtectedRoute>} />
                <Route path="/admin/resources" element={<ProtectedRoute requiredRole="admin"><AdminResources /></ProtectedRoute>} />
                <Route path="/admin/memories" element={<ProtectedRoute requiredRole="admin"><AdminMemories /></ProtectedRoute>} />
                <Route path="/admin/questions" element={<ProtectedRoute requiredRole="admin"><AdminQuestions /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />
                <Route path="/admin/content" element={<ProtectedRoute requiredRole="admin"><ContentManagement /></ProtectedRoute>} />
                <Route path="/admin/faq" element={<ProtectedRoute requiredRole="admin"><Faq /></ProtectedRoute>} />

                {/* Super Admin Routes */}
                <Route path="/super-admin" element={<ProtectedRoute requiredRole="superadmin"><SuperAdmin /></ProtectedRoute>} />
                <Route path="/super-admin/churches" element={<ProtectedRoute requiredRole="superadmin"><SuperAdminChurches /></ProtectedRoute>} />
                <Route path="/super-admin/users" element={<ProtectedRoute requiredRole="superadmin"><SuperAdminUsers /></ProtectedRoute>} />
                <Route path="/super-admin/settings" element={<ProtectedRoute requiredRole="superadmin"><SuperAdminSettings /></ProtectedRoute>} />
                <Route path="/super-admin/questions" element={<ProtectedRoute requiredRole="superadmin"><MyQuestions /></ProtectedRoute>} />
                <Route path="/super-admin/faq" element={<ProtectedRoute requiredRole="superadmin"><Faq /></ProtectedRoute>} />

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
