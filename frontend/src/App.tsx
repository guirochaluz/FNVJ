import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import ClientsPage from './pages/ClientsPage'
import SalesPage from './pages/SalesPage'
import ExpensesPage from './pages/ExpensesPage'
import ReportsPage from './pages/ReportsPage'
import AccessControlPage from './pages/AccessControlPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute module="dashboard">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clientes"
        element={
          <ProtectedRoute module="clients">
            <ClientsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendas"
        element={
          <ProtectedRoute module="sales">
            <SalesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/despesas"
        element={
          <ProtectedRoute module="expenses">
            <ExpensesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/relatorios"
        element={
          <ProtectedRoute module="reports">
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/acessos"
        element={
          <ProtectedRoute module="access">
            <AccessControlPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
