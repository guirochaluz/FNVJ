import { createContext, useCallback, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import { DEFAULT_USERS, MASTER_ALLOWED, MODULES } from '../data/initialData'
import type { ModuleDefinition, ModuleKey, UserAccount, UserRole } from '../types'
import { usePersistentState } from '../hooks/usePersistentState'

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  name: string
  email: string
  password: string
  role: UserRole
  allowedModules: ModuleKey[]
}

interface UpdatePayload {
  id: string
  name?: string
  role?: UserRole
  password?: string
  allowedModules?: ModuleKey[]
}

interface AuthContextValue {
  users: UserAccount[]
  currentUser: UserAccount | null
  modules: ModuleDefinition[]
  login: (payload: LoginPayload) => void
  logout: () => void
  registerUser: (payload: RegisterPayload) => UserAccount
  updateUser: (payload: UpdatePayload) => void
  toggleUserActive: (id: string) => void
  hasAccess: (module: ModuleKey) => boolean
  isMaster: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2, 11)}`

const CURRENT_USER_STORAGE = 'fnvj:current-user'
const USERS_STORAGE = 'fnvj:users'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = usePersistentState<UserAccount[]>(USERS_STORAGE, DEFAULT_USERS)
  const [currentUserId, setCurrentUserId] = usePersistentState<string | null>(CURRENT_USER_STORAGE, null)

  const currentUser = useMemo(
    () => users.find((user) => user.id === currentUserId) ?? null,
    [users, currentUserId],
  )

  const login = useCallback(
    ({ email, password }: LoginPayload) => {
      const trimmedEmail = email.trim().toLowerCase()
      const candidate = users.find(
        (user) => user.email.toLowerCase() === trimmedEmail && user.password === password,
      )

      if (!candidate) {
        throw new Error('Credenciais inválidas. Verifique e tente novamente.')
      }

      if (!candidate.active) {
        throw new Error('Usuário inativo. Entre em contato com o administrador.')
      }

      const updatedUser: UserAccount = {
        ...candidate,
        lastLogin: new Date().toISOString(),
      }

      setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
      setCurrentUserId(updatedUser.id)
    },
    [users, setUsers, setCurrentUserId],
  )

  const logout = useCallback(() => {
    setCurrentUserId(null)
  }, [setCurrentUserId])

  const registerUser = useCallback(
    ({ name, email, password, role, allowedModules }: RegisterPayload) => {
      const trimmedEmail = email.trim().toLowerCase()
      const alreadyExists = users.some((user) => user.email.toLowerCase() === trimmedEmail)
      if (alreadyExists) {
        throw new Error('Já existe um usuário cadastrado com este e-mail.')
      }

      const user: UserAccount = {
        id: generateId(),
        name: name.trim(),
        email: trimmedEmail,
        password,
        role,
        active: true,
        allowedModules: role === 'master' ? MASTER_ALLOWED : Array.from(new Set(allowedModules)),
        lastLogin: undefined,
      }

      setUsers([...users, user])
      return user
    },
    [setUsers, users],
  )

  const updateUser = useCallback(
    ({ id, name, role, password, allowedModules }: UpdatePayload) => {
      setUsers((prev) =>
        prev.map((user) => {
          if (user.id !== id) return user
          if (user.role === 'master' && role && role !== 'master') {
            // Master sempre permanece como master
            return {
              ...user,
              name: name ?? user.name,
              password: password ?? user.password,
              allowedModules: MASTER_ALLOWED,
            }
          }

          return {
            ...user,
            name: name ?? user.name,
            role: role ?? user.role,
            password: password ?? user.password,
            allowedModules:
              user.role === 'master'
                ? MASTER_ALLOWED
                : allowedModules
                ? Array.from(new Set(allowedModules))
                : user.allowedModules,
          }
        }),
      )
    },
    [setUsers],
  )

  const toggleUserActive = useCallback(
    (id: string) => {
      setUsers((prev) =>
        prev.map((user) => {
          if (user.id !== id) return user
          if (user.role === 'master') return user
          return { ...user, active: !user.active }
        }),
      )
    },
    [setUsers],
  )

  const hasAccess = useCallback(
    (module: ModuleKey) => {
      if (!currentUser) return false
      if (currentUser.role === 'master') return true
      return currentUser.allowedModules.includes(module)
    },
    [currentUser],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      users,
      currentUser,
      modules: MODULES,
      login,
      logout,
      registerUser,
      updateUser,
      toggleUserActive,
      hasAccess,
      isMaster: currentUser?.role === 'master',
    }),
    [currentUser, hasAccess, login, logout, registerUser, toggleUserActive, updateUser, users],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro do AuthProvider')
  }
  return context
}
