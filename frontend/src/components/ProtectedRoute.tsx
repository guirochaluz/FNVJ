import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import type { ModuleKey } from '../types'
import Layout from './Layout'

interface ProtectedRouteProps {
  children: ReactNode
  module?: ModuleKey
}

export const ProtectedRoute = ({ children, module }: ProtectedRouteProps) => {
  const { currentUser, hasAccess } = useAuth()

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (module && !hasAccess(module)) {
    return <Navigate to="/" replace />
  }

  return <Layout>{children}</Layout>
}

export default ProtectedRoute
