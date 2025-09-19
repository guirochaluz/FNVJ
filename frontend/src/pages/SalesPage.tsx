import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { CalendarDays, DollarSign, Edit, FilePlus2, Percent, Search, Trash2 } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import type { Sale } from '../types'

const paymentMethods = ['Pix', 'Cartão de Crédito', 'Boleto', 'Transferência', 'Dinheiro']

const createDefaultForm = () => ({
  collaboratorId: '',
  clientId: '',
  productId: '',
  quantity: 1,
  discountPercentage: 0,
  discountValue: 0,
  paymentMethod: 'Pix',
  observation: '',
  date: new Date().toISOString().slice(0, 10),
})

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export const SalesPage = () => {
  const { sales, clients, products, upsertSale, removeSale } = useData()
  const { users } = useAuth()
  const [form, setForm] = useState(createDefaultForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [clientFilter, setClientFilter] = useState<'all' | string>('all')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const collaborators = useMemo(() => users.filter((user) => user.active && user.role !== 'master'), [users])

  const currentProduct = products.find((product) => product.id === form.productId)
  const subtotal = (currentProduct?.price ?? 0) * form.quantity
  const totalPreview = subtotal - subtotal * (form.discountPercentage / 100) - form.discountValue

  const filteredSales = useMemo(() => {
    const query = search.trim().toLowerCase()
    return sales.filter((sale) => {
      const matchesClient = clientFilter === 'all' || sale.clientId === clientFilter
      const matchesDate = dateFilter ? sale.date === dateFilter : true
      const client = clients.find((clientItem) => clientItem.id === sale.clientId)
      const collaborator = users.find((user) => user.id === sale.collaboratorId)
      const matchesSearch =
        query.length === 0 ||
        client?.name.toLowerCase().includes(query) ||
        collaborator?.name.toLowerCase().includes(query)
      return matchesClient && matchesDate && matchesSearch
    })
  }, [sales, clientFilter, dateFilter, search, clients, users])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.collaboratorId || !form.clientId || !form.productId) {
      setFeedback('Selecione colaborador, cliente e produto para registrar a venda.')
      return
    }
    const payload = { ...form }
    if (editingId) {
      upsertSale({ ...payload, id: editingId })
      setFeedback('Venda atualizada com sucesso!')
    } else {
      upsertSale(payload)
      setFeedback('Venda registrada com sucesso!')
    }
    setEditingId(null)
    setForm(createDefaultForm())
    setTimeout(() => setFeedback(null), 2500)
  }

  const handleEdit = (sale: Sale) => {
    setEditingId(sale.id)
    setForm({
      collaboratorId: sale.collaboratorId,
      clientId: sale.clientId,
      productId: sale.productId,
      quantity: sale.quantity,
      discountPercentage: sale.discountPercentage,
      discountValue: sale.discountValue,
      paymentMethod: sale.paymentMethod,
      observation: sale.observation ?? '',
      date: sale.date,
    })
  }

  const handleDelete = (sale: Sale) => {
    if (!window.confirm('Deseja remover esta venda? Ela será excluída do relatório analítico.')) return
    removeSale(sale.id)
    setFeedback('Venda removida com sucesso!')
    setTimeout(() => setFeedback(null), 2500)
  }

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-xl font-semibold text-white">Cadastro e edição de vendas</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Registre interações comerciais com cálculo automático de totais e integração com o painel analítico.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-500/20 text-brand-100">
              <FilePlus2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {editingId ? 'Editar venda' : 'Nova venda'}
              </h3>
              <p className="text-xs text-zinc-500">Controle de desconto, forma de pagamento e observações estratégicas.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-xs uppercase tracking-wide text-zinc-500">
              Colaborador
              <select
                value={form.collaboratorId}
                onChange={(event) => setForm((prev) => ({ ...prev, collaboratorId: event.target.value }))}
                required
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
              >
                <option value="">Selecione</option>
                {collaborators.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs uppercase tracking-wide text-zinc-500">
              Cliente
              <select
                value={form.clientId}
                onChange={(event) => setForm((prev) => ({ ...prev, clientId: event.target.value }))}
                required
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
              >
                <option value="">Selecione</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs uppercase tracking-wide text-zinc-500">
              Produto
              <select
                value={form.productId}
                onChange={(event) => setForm((prev) => ({ ...prev, productId: event.target.value }))}
                required
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
              >
                <option value="">Selecione</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs uppercase tracking-wide text-zinc-500">
              Quantidade
              <input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, quantity: Number(event.target.value) || 1 }))
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
              />
            </label>
            <label className="text-xs uppercase tracking-wide text-zinc-500">
              Desconto %
              <input
                type="number"
                min={0}
                max={100}
                value={form.discountPercentage}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, discountPercentage: Number(event.target.value) || 0 }))
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
              />
            </label>
            <label className="text-xs uppercase tracking-wide text-zinc-500">
              Desconto R$
              <input
                type="number"
                min={0}
                value={form.discountValue}
                onChange={(event) => setForm((prev) => ({ ...prev, discountValue: Number(event.target.value) || 0 }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
              />
            </label>
            <label className="text-xs uppercase tracking-wide text-zinc-500">
              Forma de pagamento
              <select
                value={form.paymentMethod}
                onChange={(event) => setForm((prev) => ({ ...prev, paymentMethod: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs uppercase tracking-wide text-zinc-500">
              Observação
              <textarea
                value={form.observation}
                onChange={(event) => setForm((prev) => ({ ...prev, observation: event.target.value }))}
                rows={3}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-brand-400 focus:outline-none"
                placeholder="Detalhes negociados, upsell, condições especiais"
              />
            </label>
            <label className="text-xs uppercase tracking-wide text-zinc-500">
              Data da venda
              <input
                type="date"
                value={form.date}
                onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-brand-500/40 bg-brand-500/10 p-4 text-sm text-brand-100 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <DollarSign className="h-6 w-6" />
              <div>
                <p className="text-xs uppercase tracking-wide text-brand-200">Total da venda</p>
                <p className="text-2xl font-semibold text-white">{currency.format(Math.max(totalPreview, 0))}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Percent className="h-6 w-6" />
              <div>
                <p className="text-xs uppercase tracking-wide text-brand-200">Subtotal</p>
                <p className="text-lg font-medium text-white/80">{currency.format(subtotal)}</p>
              </div>
            </div>
          </div>

          {feedback && <p className="rounded-xl border border-brand-500/40 bg-brand-500/10 px-4 py-2 text-xs text-brand-100">{feedback}</p>}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-brand-400"
            >
              <FilePlus2 className="h-4 w-4" />
              {editingId ? 'Salvar venda' : 'Cadastrar venda'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingId(null)
                setForm(createDefaultForm())
              }}
              className="flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-brand-400 hover:text-white"
            >
              Limpar formulário
            </button>
          </div>
        </form>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200">
              <Search className="h-4 w-4" />
              <input
                placeholder="Buscar por cliente ou colaborador"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <select
                value={clientFilter}
                onChange={(event) => setClientFilter(event.target.value as typeof clientFilter)}
                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
              >
                <option value="all">Todos os clientes</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="max-h-[520px] space-y-3 overflow-y-auto pr-2">
            {filteredSales.map((sale) => {
              const collaborator = users.find((user) => user.id === sale.collaboratorId)
              const client = clients.find((clientItem) => clientItem.id === sale.clientId)
              const product = products.find((productItem) => productItem.id === sale.productId)
              return (
                <div
                  key={sale.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-4 transition hover:border-brand-400/60 hover:bg-black/20"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{client?.name}</h4>
                      <p className="text-xs text-zinc-500">{collaborator?.name}</p>
                      <p className="text-xs text-zinc-500">{product?.name}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 text-brand-100">
                        {currency.format(sale.total)}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-zinc-300">
                        {new Date(sale.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  {sale.observation && <p className="mt-3 text-xs text-zinc-400">{sale.observation}</p>}
                  <div className="mt-4 flex flex-wrap gap-3 text-xs">
                    <button
                      onClick={() => handleEdit(sale)}
                      className="flex items-center gap-1 rounded-2xl border border-brand-500/50 px-4 py-2 font-medium text-brand-100 transition hover:bg-brand-500/20"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(sale)}
                      className="flex items-center gap-1 rounded-2xl border border-red-500/40 px-4 py-2 font-medium text-red-200 transition hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </button>
                    <span className="flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-zinc-300">
                      <CalendarDays className="h-4 w-4" /> {sale.paymentMethod}
                    </span>
                  </div>
                </div>
              )
            })}
            {filteredSales.length === 0 && (
              <p className="rounded-2xl border border-white/10 bg-black/20 p-6 text-center text-sm text-zinc-500">
                Nenhuma venda encontrada com os filtros aplicados.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default SalesPage
