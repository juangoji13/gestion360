import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Layout from './components/layout/Layout'
import ErrorBoundary from './components/layout/ErrorBoundary'
import { ROUTES } from './config/routes'

// Solo mantenemos los componentes de configuración inicial aquí
const BusinessSetup = lazy(() => import('./pages/BusinessSetup'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const ConfirmSuccess = lazy(() => import('./pages/ConfirmSuccess'))

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-muted)' }}>Cargando ERP...</p>
    </div>
  )
}

function AppRoutes() {
  const { user, business, loading } = useAuth()

  if (loading) return <LoadingScreen />

  // If logged in but no business yet → setup form
  if (user && !business) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/setup" element={<BusinessSetup />} />
          <Route path="*" element={<Navigate to="/setup" />} />
        </Routes>
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/confirmed" element={<ConfirmSuccess />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {Object.values(ROUTES).map(route => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  )
}
