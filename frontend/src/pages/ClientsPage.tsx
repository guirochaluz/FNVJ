import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { PlusCircle, RefreshCcw, Search, UserPen, Users } from 'lucide-react'
import type { Client } from '../types'
import { useData } from '../context/DataContext'

const origins = ['Indicação', 'Evento', 'Parceria', 'Campanha Digital', 'Orgânico', 'Outros']

const emptyForm: Omit<Client, 'id' | 'createdAt'> = {
  name: '',
  email: '',
  phone: '',
  document: '',
  origin: 'Indicação',
  birthDate: '',
  accountLink: '',
  notes: '',
}

export const ClientsPage = () => {
  const { clients, upsertClient, removeClient } = useData()
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [originFilter, setOriginFilter] = useState<'all' | string>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase()
    return clients.filter((client) => {
      const matchesQuery =
        query.length === 0 ||
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.phone.toLowerCase().includes(query) ||
        client.document.replace(/\D/g, '').includes(query.replace(/\D/g, ''))
      const matchesOrigin = originFilter === 'all' || client.origin === originFilter
      return matchesQuery && matchesOrigin
    })
  }, [clients, originFilter, search])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload = { ...form }
    if (editingId) {
      upsertClient({ ...payload, id: editingId })
      setFeedback('Cliente atualizado com sucesso!')
    } else {
      upsertClient(payload)
      setFeedback('Cliente cadastrado com sucesso!')
    }
    setEditingId(null)
    setForm(emptyForm)
    setTimeout(() => setFeedback(null), 2500)
  }

  const handleEdit = (client: Client) => {
    setEditingId(client.id)
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      document: client.document,
      origin: client.origin,
      birthDate: client.birthDate ?? '',
      accountLink: client.accountLink ?? '',
      notes: client.notes ?? '',
    })
  }

  const handleDelete = (client: Client) => {
    if (!window.confirm(`Deseja realmente remover ${client.name}? As vendas relacionadas serão removidas do histórico.`))
      return
    removeClient(client.id)
    setFeedback('Cliente removido com sucesso!')
    setTimeout(() => setFeedback(null), 2500)
    if (editingId === client.id) {
      setEditingId(null)
      setForm(emptyForm)
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Cadastro de Clientes</h2>
          <p className="text-sm text-zinc-500">
            Centralize as informações cadastrais com validações e histórico para potencializar suas vendas.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200">
          <Users className="h-4 w-4" />
          {clients.length} clientes ativos
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500/20 text-brand-100">
              <UserPen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {editingId ? 'Editar cliente' : 'Cadastrar novo cliente'}
              </h3>
              <p className="text-xs text-zinc-500">
                Campos essenciais para cadastro completo e habilitação no funil de vendas.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-xs uppercase tracking-wide text-zinc-500">
              Nome completo
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none"
                placeholder="Nome do cliente"
              />
            </label>
            <label className="text-xs uppercase tracking-wide text-zinc-500">
              Telefone
              <input
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                required
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none"
                placeholder="(00) 00000-0000"
              />
            </label>
            <label className="text-xs uppercase tracking-wide text-zinc-500">
              E-mail
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                required
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none"
                placeholder="nome@email.com"
              />
            </label>
            <label className="text-xs uppercase tracking-wide text-zinc-500">
              CPF / CNPJ
              <input
                value={form.document}
                onChange={(event) => setForm((prev) => ({ ...prev, document: event.target.value }))}
                required
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none"
                placeholder="000.000.000-00"
              />
            </label>
            <label className="text-xs uppercase tracking-wide text-zinc-500">
              Data de nascimento
              <input
                type="date"
                value={form.birthDate}
                onChange={(event) => setForm((prev) => ({ ...prev, birthDate: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
              />
            </label>
            <label className="text-xs uppercase tracking-wide text-zinc-500">
              Origem do cliente
              <select
                value={form.origin}
                onChange={(event) => setForm((prev) => ({ ...prev, origin: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
              >
                {origins.map((originOption) => (
                  <option key={originOption} value={originOption}>
                    {originOption}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs uppercase tracking-wide text-zinc-500">
              Link da conta
              <input
                value={form.accountLink}
                onChange={(event) => setForm((prev) => ({ ...prev, accountLink: event.target.value }))}
                placeholder="https://instagram.com/cliente"
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none"
              />
            </label>
            <label className="text-xs uppercase tracking-wide text-zinc-500 sm:col-span-2">
              Observações
              <textarea
                value={form.notes ?? ''}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                rows={3}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none"
                placeholder="Informações complementares, preferências, etc."
              />
            </label>
          </div>
          {feedback && <p className="rounded-xl border border-brand-500/40 bg-brand-500/10 px-4 py-2 text-xs text-brand-100">{feedback}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-brand-400"
            >
              <PlusCircle className="h-4 w-4" />
              {editingId ? 'Salvar alterações' : 'Cadastrar cliente'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingId(null)
                setForm(emptyForm)
              }}
              className="flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-brand-400 hover:text-white"
            >
              <RefreshCcw className="h-4 w-4" />
              Limpar campos
            </button>
          </div>
        </form>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200">
              <Search className="h-4 w-4" />
              <input
                placeholder="Pesquisar por nome, e-mail ou documento"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
              />
            </div>
            <select
              value={originFilter}
              onChange={(event) => setOriginFilter(event.target.value as typeof originFilter)}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
            >
              <option value="all">Todas as origens</option>
              {origins.map((originOption) => (
                <option key={originOption} value={originOption}>
                  {originOption}
                </option>
              ))}
            </select>
          </div>

          <div className="max-h-[520px] space-y-3 overflow-y-auto pr-2">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="rounded-2xl border border-white/10 bg-black/30 p-4 transition hover:border-brand-400/60 hover:bg-black/20"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{client.name}</h4>
                    <p className="text-xs text-zinc-500">{client.email}</p>
                    <p className="text-xs text-zinc-500">{client.phone}</p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 text-brand-100">
                      {client.origin}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-zinc-300">
                      Cadastrado em {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                {client.notes && <p className="mt-3 text-xs text-zinc-400">{client.notes}</p>}
                <div className="mt-4 flex flex-wrap gap-3 text-xs">
                  <button
                    onClick={() => handleEdit(client)}
                    className="rounded-2xl border border-brand-500/50 px-4 py-2 font-medium text-brand-100 transition hover:bg-brand-500/20"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(client)}
                    className="rounded-2xl border border-red-500/40 px-4 py-2 font-medium text-red-200 transition hover:bg-red-500/20"
                  >
                    Remover
                  </button>
                  {client.accountLink && (
                    <a
                      href={client.accountLink}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl border border-white/10 px-4 py-2 font-medium text-zinc-300 transition hover:border-brand-400 hover:text-white"
                    >
                      Abrir perfil
                    </a>
                  )}
                </div>
              </div>
            ))}
            {filteredClients.length === 0 && (
              <p className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-sm text-zinc-500">
                Nenhum cliente encontrado com os filtros selecionados.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default ClientsPage
