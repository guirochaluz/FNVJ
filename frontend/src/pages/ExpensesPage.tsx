import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Banknote, RefreshCcw, Search, WalletCards } from 'lucide-react'
import { useData } from '../context/DataContext'
import type { Expense } from '../types'

const classifications = ['Marketing', 'Operacional', 'Comissão', 'Eventos', 'Tecnologia', 'Outros']

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const createDefaultForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  classification: 'Marketing',
  description: '',
  value: 0,
})

export const ExpensesPage = () => {
  const { expenses, upsertExpense, removeExpense } = useData()
  const [form, setForm] = useState(createDefaultForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase()
    return expenses.filter((expense) => {
      return (
        query.length === 0 ||
        expense.description.toLowerCase().includes(query) ||
        expense.classification.toLowerCase().includes(query)
      )
    })
  }, [expenses, search])

  const totalExpenses = useMemo(() => expenses.reduce((acc, item) => acc + item.value, 0), [expenses])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload = { ...form, value: Number(form.value) }
    if (!payload.description) {
      setFeedback('Descreva a despesa para manter o histórico organizado.')
      return
    }
    if (payload.value <= 0) {
      setFeedback('Informe um valor maior que zero.')
      return
    }
    if (editingId) {
      upsertExpense({ ...payload, id: editingId })
      setFeedback('Despesa atualizada!')
    } else {
      upsertExpense(payload)
      setFeedback('Despesa cadastrada!')
    }
    setEditingId(null)
    setForm(createDefaultForm())
    setTimeout(() => setFeedback(null), 2500)
  }

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id)
    setForm({
      date: expense.date,
      classification: expense.classification,
      description: expense.description,
      value: expense.value,
    })
  }

  const handleDelete = (expense: Expense) => {
    if (!window.confirm('Confirmar exclusão desta despesa?')) return
    removeExpense(expense.id)
    setFeedback('Despesa removida com sucesso!')
    setTimeout(() => setFeedback(null), 2500)
    if (editingId === expense.id) {
      setEditingId(null)
      setForm(createDefaultForm())
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Controle de despesas</h2>
          <p className="text-sm text-zinc-500">Mantenha o acompanhamento financeiro integrado com o painel analítico.</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200">
          <WalletCards className="h-4 w-4" />
          {currency.format(totalExpenses)} gastos acumulados
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500/20 text-brand-100">
              <Banknote className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{editingId ? 'Editar despesa' : 'Cadastrar despesa'}</h3>
              <p className="text-xs text-zinc-500">Registre investimentos, custos e eventos com classificação padronizada.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-xs uppercase tracking-wide text-zinc-500">
              Data
              <input
                type="date"
                value={form.date}
                onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
              />
            </label>
            <label className="text-xs uppercase tracking-wide text-zinc-500">
              Classificação
              <select
                value={form.classification}
                onChange={(event) => setForm((prev) => ({ ...prev, classification: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
              >
                {classifications.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs uppercase tracking-wide text-zinc-500 sm:col-span-2">
              Descrição
              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                rows={3}
                placeholder="Ex: Campanha de mídia paga, deslocamento, assinatura de software..."
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none"
              />
            </label>
            <label className="text-xs uppercase tracking-wide text-zinc-500">
              Valor (R$)
              <input
                type="number"
                min={0}
                value={form.value}
                onChange={(event) => setForm((prev) => ({ ...prev, value: Number(event.target.value) }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
              />
            </label>
          </div>
          {feedback && <p className="rounded-xl border border-brand-500/40 bg-brand-500/10 px-4 py-2 text-xs text-brand-100">{feedback}</p>}
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-brand-400"
            >
              Registrar
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingId(null)
                setForm(createDefaultForm())
              }}
              className="flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-brand-400 hover:text-white"
            >
              <RefreshCcw className="h-4 w-4" />
              Limpar
            </button>
          </div>
        </form>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200">
            <Search className="h-4 w-4" />
            <input
              placeholder="Filtrar por descrição ou categoria"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
            />
          </div>

          <div className="max-h-[520px] space-y-3 overflow-y-auto pr-2">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="rounded-2xl border border-white/10 bg-black/30 p-4 transition hover:border-brand-400/60 hover:bg-black/20"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{expense.description}</h4>
                    <p className="text-xs text-zinc-500">{expense.classification}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 text-brand-100">
                      {currency.format(expense.value)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-zinc-300">
                      {new Date(expense.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="rounded-2xl border border-brand-500/50 px-4 py-2 font-medium text-brand-100 transition hover:bg-brand-500/20"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(expense)}
                    className="rounded-2xl border border-red-500/40 px-4 py-2 font-medium text-red-200 transition hover:bg-red-500/20"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
            {filteredExpenses.length === 0 && (
              <p className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-sm text-zinc-500">
                Nenhuma despesa cadastrada até o momento.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default ExpensesPage
