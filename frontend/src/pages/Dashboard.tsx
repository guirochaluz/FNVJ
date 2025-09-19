import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'
import { CalendarClock, TrendingUp, UsersRound, Wallet } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import type { DashboardFilters } from '../types'
import StatCard from '../components/StatCard'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const percentage = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const COLORS = ['#44c575', '#77dd9f', '#1d9c4e', '#0f6131', '#62f5a1']

export const Dashboard = () => {
  const { sales, expenses, clients, products } = useData()
  const { users } = useAuth()
  const currentYear = new Date().getFullYear()
  const [filters, setFilters] = useState<DashboardFilters>({
    year: currentYear,
    collaboratorId: 'all',
    clientId: 'all',
    productId: 'all',
  })

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const saleYear = new Date(sale.date).getFullYear()
      if (filters.year !== 'all' && saleYear !== filters.year) return false
      if (filters.collaboratorId !== 'all' && sale.collaboratorId !== filters.collaboratorId) return false
      if (filters.clientId !== 'all' && sale.clientId !== filters.clientId) return false
      if (filters.productId !== 'all' && sale.productId !== filters.productId) return false
      return true
    })
  }, [sales, filters])

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const expenseYear = new Date(expense.date).getFullYear()
      if (filters.year !== 'all' && expenseYear !== filters.year) return false
      return true
    })
  }, [expenses, filters])

  const analytics = useMemo(() => {
    const grossRevenue = filteredSales.reduce((acc, sale) => acc + sale.subtotal, 0)
    const netRevenue = filteredSales.reduce((acc, sale) => acc + sale.total, 0)
    const discountsValue = grossRevenue - netRevenue
    const commissionRate = 0.06
    const commissions = netRevenue * commissionRate
    const expensesTotal = filteredExpenses.reduce((acc, item) => acc + item.value, 0)
    const netProfit = netRevenue - commissions - expensesTotal
    const avgTicket = filteredSales.length > 0 ? netRevenue / filteredSales.length : 0

    const byMonth = Array.from({ length: 12 }, (_, index) => {
      const month = index + 1
      const monthSales = filteredSales.filter(
        (sale) => new Date(sale.date).getMonth() + 1 === month,
      )
      const gross = monthSales.reduce((acc, sale) => acc + sale.subtotal, 0)
      const net = monthSales.reduce((acc, sale) => acc + sale.total, 0)
      return {
        month,
        gross,
        net,
        discount: gross - net,
      }
    })

    const byClient = filteredSales.reduce<Record<string, number>>((acc, sale) => {
      acc[sale.clientId] = (acc[sale.clientId] ?? 0) + sale.total
      return acc
    }, {})

    const byProduct = filteredSales.reduce<Record<string, number>>((acc, sale) => {
      acc[sale.productId] = (acc[sale.productId] ?? 0) + sale.quantity
      return acc
    }, {})

    const byCollaborator = filteredSales.reduce<Record<string, { revenue: number; quantity: number }>>(
      (acc, sale) => {
        acc[sale.collaboratorId] = acc[sale.collaboratorId] ?? { revenue: 0, quantity: 0 }
        acc[sale.collaboratorId].revenue += sale.total
        acc[sale.collaboratorId].quantity += sale.quantity
        return acc
      },
      {},
    )

    return {
      grossRevenue,
      netRevenue,
      discountsValue,
      commissions,
      expensesTotal,
      netProfit,
      avgTicket,
      salesCount: filteredSales.length,
      byMonth,
      byClient,
      byProduct,
      byCollaborator,
    }
  }, [filteredSales, filteredExpenses])

  const topClients = useMemo(() => {
    return Object.entries(analytics.byClient)
      .map(([clientId, value]) => ({
        clientId,
        value,
        client: clients.find((client) => client.id === clientId)?.name ?? 'Cliente',
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [analytics.byClient, clients])

  const topCollaborators = useMemo(() => {
    return Object.entries(analytics.byCollaborator)
      .map(([collaboratorId, data]) => ({
        collaboratorId,
        ...data,
        collaborator:
          users.find((user) => user.id === collaboratorId)?.name ?? 'Colaborador desconhecido',
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }, [analytics.byCollaborator, users])

  const productDistribution = useMemo(() => {
    return Object.entries(analytics.byProduct).map(([productId, quantity]) => ({
      productId,
      quantity,
      product: products.find((product) => product.id === productId)?.name ?? 'Produto',
    }))
  }, [analytics.byProduct, products])

  const handleFilterChange = <T extends keyof DashboardFilters>(key: T, value: DashboardFilters[T]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      year: currentYear,
      collaboratorId: 'all',
      clientId: 'all',
      productId: 'all',
    })
  }

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <StatCard
          title="Receita Bruta"
          value={currency.format(analytics.grossRevenue)}
          helper={`Ticket médio ${currency.format(analytics.avgTicket || 0)}`}
          icon={<TrendingUp className="h-10 w-10" />}
          accent="brand"
        />
        <StatCard
          title="Descontos"
          value={currency.format(analytics.discountsValue)}
          helper={percentage.format(
            analytics.grossRevenue === 0 ? 0 : analytics.discountsValue / analytics.grossRevenue,
          )}
          icon={<CalendarClock className="h-10 w-10" />}
          accent="emerald"
        />
        <StatCard
          title="Receita Líquida"
          value={currency.format(analytics.netRevenue)}
          helper={`Comissão estimada ${currency.format(analytics.commissions)}`}
          icon={<Wallet className="h-10 w-10" />}
          accent="sky"
        />
        <StatCard
          title="Lucro Estimado"
          value={currency.format(analytics.netProfit)}
          helper={`Despesas ${currency.format(analytics.expensesTotal)}`}
          icon={<UsersRound className="h-10 w-10" />}
          accent="amber"
        />
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Relatório de Vendas</h2>
            <p className="text-sm text-zinc-500">
              Última atualização {new Date().toLocaleString('pt-BR')} • {analytics.salesCount} vendas consideradas
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs uppercase tracking-wide text-zinc-500">
              Ano
              <select
                value={filters.year}
                onChange={(event) =>
                  handleFilterChange('year', event.target.value === 'all' ? 'all' : Number(event.target.value))
                }
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
              >
                <option value="all">Todos</option>
                {[currentYear - 1, currentYear, currentYear + 1].map((yearOption) => (
                  <option key={yearOption} value={yearOption}>
                    {yearOption}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs uppercase tracking-wide text-zinc-500">
              Colaborador
              <select
                value={filters.collaboratorId}
                onChange={(event) => handleFilterChange('collaboratorId', event.target.value as typeof filters.collaboratorId)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
              >
                <option value="all">Todos</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs uppercase tracking-wide text-zinc-500">
              Cliente
              <select
                value={filters.clientId}
                onChange={(event) => handleFilterChange('clientId', event.target.value as typeof filters.clientId)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
              >
                <option value="all">Todos</option>
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
                value={filters.productId}
                onChange={(event) => handleFilterChange('productId', event.target.value as typeof filters.productId)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
              >
                <option value="all">Todos</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <button
          onClick={resetFilters}
          className="mt-4 rounded-xl border border-white/10 px-3 py-1 text-xs uppercase tracking-wide text-zinc-400 transition hover:border-brand-400 hover:text-white"
        >
          Limpar filtros
        </button>
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-3xl border border-white/5 bg-black/20 p-4">
            <h3 className="mb-4 text-sm font-semibold text-white">Evolução Mensal</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={analytics.byMonth} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#44c575" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#44c575" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f272d" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(value) => value.toString().padStart(2, '0')}
                  stroke="#4b5563"
                  fontSize={12}
                />
                <YAxis stroke="#4b5563" fontSize={12} tickFormatter={(value) => currency.format(value).replace('R$\xa0', '')} />
                <Tooltip
                  formatter={(value: number) => currency.format(value)}
                  contentStyle={{ background: '#111418', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <Area type="monotone" dataKey="net" stroke="#44c575" fillOpacity={1} fill="url(#colorNet)" />
                <Area type="monotone" dataKey="gross" stroke="#4ade80" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-3xl border border-white/5 bg-black/20 p-4">
            <h3 className="mb-4 text-sm font-semibold text-white">Distribuição por Produto</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={productDistribution}
                  dataKey="quantity"
                  nameKey="product"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                >
                  {productDistribution.map((entry, index) => (
                    <Cell key={entry.productId} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, _name, payload) => [`${value} vendas`, payload?.payload.product]}
                  contentStyle={{ background: '#111418', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <header className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Top 5 clientes por receita líquida</h3>
              <p className="text-xs text-zinc-500">Mostra os clientes mais representativos no período selecionado.</p>
            </div>
          </header>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topClients} layout="vertical" margin={{ left: 80, right: 16, top: 24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f272d" />
              <XAxis type="number" tickFormatter={(value) => currency.format(value).replace('R$\xa0', '')} stroke="#4b5563" />
              <YAxis dataKey="client" type="category" width={80} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip formatter={(value: number) => currency.format(value)} contentStyle={{ background: '#111418', borderRadius: 16 }} />
              <Bar dataKey="value" radius={[12, 12, 12, 12]} fill="#44c575" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <header className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Ranking de colaboradores</h3>
              <p className="text-xs text-zinc-500">Faturamento líquido e volume negociado.</p>
            </div>
          </header>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topCollaborators} margin={{ left: 0, right: 16, top: 24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f272d" />
              <XAxis dataKey="collaborator" tick={{ fill: '#9ca3af', fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={80} />
              <YAxis yAxisId="revenue" tickFormatter={(value) => currency.format(value).replace('R$\xa0', '')} stroke="#4b5563" />
              <YAxis yAxisId="quantity" orientation="right" stroke="#4b5563" hide />
              <Tooltip formatter={(value: number) => currency.format(value)} contentStyle={{ background: '#111418', borderRadius: 16 }} />
              <Bar dataKey="revenue" yAxisId="revenue" radius={[12, 12, 0, 0]} fill="#77dd9f" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-zinc-400">
            {topCollaborators.map((item) => (
              <div key={item.collaboratorId} className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                <p className="font-medium text-white">{item.collaborator}</p>
                <p>Receita: {currency.format(item.revenue)}</p>
                <p>Unidades vendidas: {item.quantity}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
