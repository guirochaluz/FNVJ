import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { CheckCircle2, Lock, Plus, Shield, UserCog, UserMinus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { ModuleKey, UserRole } from '../types'

const roleLabels: Record<UserRole, string> = {
  master: 'Master',
  gestor: 'Gestor',
  vendas: 'Vendas',
  financeiro: 'Financeiro',
  analista: 'Analista',
}

const createNewUserForm = () => ({
  name: '',
  email: '',
  password: '',
  role: 'vendas' as UserRole,
  allowedModules: ['dashboard', 'sales'] as ModuleKey[],
})

export const AccessControlPage = () => {
  const { users, modules, registerUser, updateUser, toggleUserActive } = useAuth()
  const [form, setForm] = useState(createNewUserForm)
  const [feedback, setFeedback] = useState<string | null>(null)
  const activeUsers = useMemo(() => users.filter((user) => user.active).length, [users])

  const handleToggleModule = (userId: string, moduleKey: ModuleKey, isChecked: boolean) => {
    const user = users.find((item) => item.id === userId)
    if (!user) return
    if (user.role === 'master') return
    const nextModules = isChecked
      ? Array.from(new Set([...user.allowedModules, moduleKey]))
      : user.allowedModules.filter((item) => item !== moduleKey)
    updateUser({ id: userId, allowedModules: nextModules })
  }

  const handleRoleChange = (userId: string, role: UserRole) => {
    updateUser({ id: userId, role })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      registerUser(form)
      setFeedback('Usuário criado com sucesso! A senha informada já está ativa.')
      setForm(createNewUserForm())
      setTimeout(() => setFeedback(null), 2500)
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Não foi possível criar o usuário.')
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Governança de acessos</h2>
          <p className="text-sm text-zinc-500">Defina quem acessa cada módulo e mantenha a operação segura.</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200">
          <Shield className="h-4 w-4" />
          {activeUsers} usuários ativos
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_1fr]">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6">
          <h3 className="text-sm font-semibold text-white">Usuários cadastrados</h3>
          <div className="max-h-[540px] space-y-4 overflow-y-auto pr-2">
            {users.map((user) => (
              <div key={user.id} className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                    <p className="text-xs text-zinc-500">Perfil: {roleLabels[user.role]}</p>
                    {user.lastLogin && (
                      <p className="text-xs text-zinc-500">Último acesso: {new Date(user.lastLogin).toLocaleString('pt-BR')}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`rounded-full px-3 py-1 ${user.active ? 'border border-brand-500/40 bg-brand-500/10 text-brand-100' : 'border border-red-500/40 bg-red-500/10 text-red-200'}`}
                    >
                      {user.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="text-xs uppercase tracking-wide text-zinc-500">
                    Nível de acesso
                    <select
                      value={user.role}
                      onChange={(event) => handleRoleChange(user.id, event.target.value as UserRole)}
                      disabled={user.role === 'master'}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none disabled:cursor-not-allowed"
                    >
                      {Object.entries(roleLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="text-xs text-zinc-400">
                    <p className="uppercase tracking-wide text-zinc-500">Status</p>
                    <button
                      onClick={() => toggleUserActive(user.id)}
                      disabled={user.role === 'master'}
                      className="mt-2 flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 font-medium text-zinc-300 transition hover:border-brand-400 hover:text-white disabled:cursor-not-allowed"
                    >
                      {user.active ? (
                        <>
                          <UserMinus className="h-4 w-4" />
                          Suspender acesso
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Reativar
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Módulos liberados</p>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {modules.map((module) => {
                      const checked = user.allowedModules.includes(module.key) || user.role === 'master'
                      return (
                        <label
                          key={module.key}
                          className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-xs transition ${
                            checked
                              ? 'border-brand-500/40 bg-brand-500/10 text-brand-100'
                              : 'border-white/10 bg-white/5 text-zinc-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={checked}
                            disabled={user.role === 'master'}
                            onChange={(event) => handleToggleModule(user.id, module.key, event.target.checked)}
                          />
                          <span>
                            <span className="block text-sm font-medium text-white">{module.label}</span>
                            <span className="text-[0.65rem] text-zinc-400">{module.description}</span>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500/20 text-brand-100">
              <UserCog className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Adicionar novo usuário</h3>
              <p className="text-xs text-zinc-500">Defina o perfil e quais módulos serão liberados para acesso.</p>
            </div>
          </div>
          <label className="text-xs uppercase tracking-wide text-zinc-500">
            Nome completo
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none"
              placeholder="Nome e sobrenome"
            />
          </label>
          <label className="text-xs uppercase tracking-wide text-zinc-500">
            E-mail corporativo
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none"
              placeholder="nome@fnvj.com.br"
            />
          </label>
          <label className="text-xs uppercase tracking-wide text-zinc-500">
            Senha provisória
            <input
              type="text"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none"
              placeholder="Senha inicial"
            />
          </label>
          <label className="text-xs uppercase tracking-wide text-zinc-500">
            Perfil
            <select
              value={form.role}
              onChange={(event) => {
                const role = event.target.value as UserRole
                setForm((prev) => ({
                  ...prev,
                  role,
                  allowedModules: role === 'financeiro' ? ['dashboard', 'expenses', 'reports'] : prev.allowedModules,
                }))
              }}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
            >
              {Object.entries(roleLabels)
                .filter(([role]) => role !== 'master')
                .map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
            </select>
          </label>
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Módulos liberados</p>
            <div className="mt-2 grid grid-cols-1 gap-2">
              {modules
                .filter((module) => module.key !== 'access')
                .map((module) => {
                  const checked = form.allowedModules.includes(module.key)
                  return (
                    <label
                      key={module.key}
                      className={`flex items-start gap-2 rounded-2xl border px-4 py-3 text-xs transition ${
                        checked
                          ? 'border-brand-500/40 bg-brand-500/10 text-brand-100'
                          : 'border-white/10 bg-white/5 text-zinc-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={checked}
                        onChange={(event) => {
                          setForm((prev) => ({
                            ...prev,
                            allowedModules: event.target.checked
                              ? Array.from(new Set([...prev.allowedModules, module.key]))
                              : prev.allowedModules.filter((item) => item !== module.key),
                          }))
                        }}
                      />
                      <span>
                        <span className="block text-sm font-medium text-white">{module.label}</span>
                        <span className="text-[0.65rem] text-zinc-400">{module.description}</span>
                      </span>
                    </label>
                  )
                })}
            </div>
          </div>
          {feedback && <p className="rounded-xl border border-brand-500/40 bg-brand-500/10 px-4 py-2 text-xs text-brand-100">{feedback}</p>}
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-brand-400"
          >
            <Plus className="h-4 w-4" />
            Criar usuário
          </button>
          <p className="text-[0.65rem] text-zinc-500">
            <Lock className="mr-1 inline h-3 w-3" /> Apenas o usuário master pode acessar esta área.
          </p>
        </form>
      </section>
    </div>
  )
}

export default AccessControlPage
