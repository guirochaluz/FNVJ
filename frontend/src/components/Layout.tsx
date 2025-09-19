import { Menu, ShieldCheck, UserCircle, LogOut } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '../context/AuthContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
    isActive
      ? 'bg-brand-500/20 text-brand-100 shadow-inner shadow-brand-500/40'
      : 'text-zinc-300 hover:bg-white/5 hover:text-white',
  )

export const Layout = ({ children }: { children: ReactNode }) => {
  const { currentUser, modules, hasAccess, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const availableModules = useMemo(
    () => modules.filter((module) => hasAccess(module.key)),
    [modules, hasAccess],
  )

  const currentModule = availableModules.find((module) => module.path === location.pathname)

  return (
    <div className="flex min-h-screen bg-surface/95 text-white">
      <aside
        className={clsx(
          'w-72 shrink-0 border-r border-white/5 bg-surface/80 backdrop-blur-xl transition-transform duration-300 md:translate-x-0',
          menuOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-0',
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-3 border-b border-white/5 px-6 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-lg font-semibold">
              FJ
            </div>
            <div>
              <p className="text-sm uppercase tracking-wide text-zinc-400">Fique no Verde Já</p>
              <p className="text-lg font-semibold text-white">Console Estratégico</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
            {availableModules.map((module) => (
              <NavLink key={module.key} to={module.path} className={navLinkClass} onClick={() => setMenuOpen(false)}>
                <ShieldCheck className="h-4 w-4 text-brand-400" />
                <span className="flex-1">{module.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-white/5 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-500/30 text-brand-100">
                <UserCircle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{currentUser?.name}</p>
                <p className="text-xs text-zinc-400">{currentUser?.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:bg-brand-500/90 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-white/5 bg-surface/70 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-zinc-200 transition hover:border-brand-400 hover:text-white md:hidden"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">Visão atual</p>
                <h1 className="text-xl font-semibold text-white">
                  {currentModule?.label ?? 'Painel FNVJ'}
                </h1>
              </div>
            </div>
            <div className="flex flex-col items-end text-right">
              <span className="text-xs text-zinc-500">Último acesso</span>
              <span className="text-sm font-medium text-white">
                {currentUser?.lastLogin
                  ? new Date(currentUser.lastLogin).toLocaleString('pt-BR')
                  : 'Primeiro acesso'}
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 bg-gradient-to-b from-surface/60 via-surface/80 to-surface px-6 py-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default Layout
