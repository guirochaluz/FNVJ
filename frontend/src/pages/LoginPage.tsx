import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, LockKeyhole, ShieldCheck, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export const LoginPage = () => {
  const { login, modules } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 450))
      login({ email, password })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível acessar o sistema.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface via-black to-surface">
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-3xl md:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden h-full flex-col justify-between bg-gradient-to-br from-brand-600 via-brand-500 to-emerald-500 px-10 py-12 text-white md:flex">
          <div>
            <span className="rounded-full border border-white/30 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/70">
              Fique no Verde Já
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight">
              Gestão de vendas, clientes e indicadores em uma única experiência.
            </h1>
            <p className="mt-4 max-w-sm text-sm text-white/80">
              Modernize o processo da Fique no Verde Já com um cockpit web pensado para segurança, performance e colaboração.
            </p>
          </div>
          <ul className="space-y-4 text-sm text-white/80">
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-4 w-4" />
              <span>Acesso controlado por perfis com visão personalizada.</span>
            </li>
            <li className="flex items-start gap-3">
              <Users className="mt-1 h-4 w-4" />
              <span>Cadastro completo de clientes, vendas, despesas e ranking de performance.</span>
            </li>
            <li className="flex items-start gap-3">
              <LockKeyhole className="mt-1 h-4 w-4" />
              <span>Usuário master com governança de permissões e auditoria de acesso.</span>
            </li>
          </ul>
        </section>
        <section className="flex flex-col justify-center bg-surface/90 px-10 py-12">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500/20 text-brand-100">
                <LockKeyhole className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Acesso ao cockpit</h2>
                <p className="text-sm text-zinc-400">
                  Utilize suas credenciais corporativas para acessar os módulos habilitados.
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block text-sm">
                <span className="text-xs uppercase tracking-wide text-zinc-500">E-mail corporativo</span>
                <input
                  type="email"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  placeholder="seu.nome@fnvj.com.br"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs uppercase tracking-wide text-zinc-500">Senha</span>
                <input
                  type="password"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              {error && <p className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs text-red-200">{error}</p>}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:bg-brand-500/60"
              >
                {isLoading ? 'Validando…' : 'Entrar no sistema'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-8">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Módulos disponíveis</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-zinc-300">
                {modules.map((module) => (
                  <div key={module.key} className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3">
                    <p className="font-medium text-white">{module.label}</p>
                    <p className="mt-1 text-[0.7rem] text-zinc-500">{module.description}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-[0.7rem] text-zinc-500">
                Dica: utilize <strong>master@fnvj.com.br</strong> com senha <strong>verde123</strong> para acessar como usuário
                master.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default LoginPage
