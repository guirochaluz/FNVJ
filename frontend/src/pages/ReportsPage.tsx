import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ClipboardList, Crown, Star, Target } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export const ReportsPage = () => {
  const { sales, clients, expenses } = useData()
  const { users } = useAuth()

  type MonthlyCollabPoint = { month: string } & Record<string, number>

  const clientFrequency = useMemo(() => {
    return clients
      .map((client) => {
        const relatedSales = sales.filter((sale) => sale.clientId === client.id)
        const total = relatedSales.reduce((acc, sale) => acc + sale.total, 0)
        return {
          clientId: client.id,
          name: client.name,
          sales: relatedSales.length,
          revenue: total,
          lastPurchase: relatedSales
            .map((sale) => sale.date)
            .sort((a, b) => (a < b ? 1 : -1))[0],
        }
      })
      .sort((a, b) => b.sales - a.sales)
  }, [clients, sales])

  const collaboratorSummary = useMemo(() => {
    return users
      .filter((user) => user.role !== 'master')
      .map((user) => {
        const relatedSales = sales.filter((sale) => sale.collaboratorId === user.id)
        const revenue = relatedSales.reduce((acc, sale) => acc + sale.total, 0)
        return {
          collaborator: user.name,
          revenue,
          closingRate: relatedSales.length,
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
  }, [sales, users])

  const expenseBreakdown = useMemo(() => {
    const map = expenses.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.classification] = (acc[expense.classification] ?? 0) + expense.value
      return acc
    }, {})
    return Object.entries(map).map(([classification, value]) => ({ classification, value }))
  }, [expenses])

  const monthlyCollab = useMemo<MonthlyCollabPoint[]>(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return months.map((month, index) => {
      const entry = { month } as MonthlyCollabPoint
      users
        .filter((user) => user.role !== 'master')
        .forEach((user) => {
          const value = sales
            .filter((sale) => new Date(sale.date).getMonth() === index && sale.collaboratorId === user.id)
            .reduce((acc, sale) => acc + sale.total, 0)
          entry[user.name] = value
        })
      return entry
    })
  }, [sales, users])

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-xl font-semibold text-white">Visão analítica complementar</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Monitore recorrência, concentração de receita e esforços comerciais para direcionar decisões estratégicas.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <Star className="h-8 w-8 text-brand-400" />
          <p className="mt-3 text-xs uppercase tracking-wide text-zinc-500">Cliente mais recorrente</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{clientFrequency[0]?.name ?? '—'}</h3>
          <p className="text-sm text-zinc-400">
            {clientFrequency[0]
              ? `${clientFrequency[0].sales} compras • ${currency.format(clientFrequency[0].revenue)}`
              : 'Sem histórico'}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <Crown className="h-8 w-8 text-brand-400" />
          <p className="mt-3 text-xs uppercase tracking-wide text-zinc-500">Maior faturamento</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{collaboratorSummary[0]?.collaborator ?? '—'}</h3>
          <p className="text-sm text-zinc-400">
            {collaboratorSummary[0]
              ? currency.format(collaboratorSummary[0].revenue)
              : 'Sem dados'}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <Target className="h-8 w-8 text-brand-400" />
          <p className="mt-3 text-xs uppercase tracking-wide text-zinc-500">Total de clientes ativos</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{clients.length}</h3>
          <p className="text-sm text-zinc-400">Base integrada ao funil comercial.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <ClipboardList className="h-8 w-8 text-brand-400" />
          <p className="mt-3 text-xs uppercase tracking-wide text-zinc-500">Despesas mapeadas</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{expenses.length}</h3>
          <p className="text-sm text-zinc-400">Categorias consolidadas no financeiro.</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
          <h3 className="text-sm font-semibold text-white">Frequência de compras por cliente</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={clientFrequency.slice(0, 7)} margin={{ top: 24, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f272d" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={70} />
              <YAxis yAxisId="sales" stroke="#4b5563" />
              <YAxis
                yAxisId="revenue"
                orientation="right"
                stroke="#4b5563"
                tickFormatter={(value) => currency.format(value).replace('R$\xa0', '')}
              />
              <Tooltip
                formatter={(value: number, name) =>
                  name === 'sales' ? `${value} vendas` : currency.format(value)
                }
                contentStyle={{ background: '#111418', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)' }}
              />
              <Legend wrapperStyle={{ color: '#9ca3af' }} />
              <Bar yAxisId="sales" dataKey="sales" name="Frequência" fill="#44c575" radius={[12, 12, 0, 0]} />
              <Bar yAxisId="revenue" dataKey="revenue" name="Receita" fill="#77dd9f" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
          <h3 className="text-sm font-semibold text-white">Distribuição das despesas</h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={expenseBreakdown} dataKey="value" nameKey="classification" innerRadius={70} outerRadius={110}>
                {expenseBreakdown.map((entry, index) => (
                  <Cell
                    key={entry.classification}
                    fill={['#44c575', '#77dd9f', '#1d9c4e', '#62f5a1', '#96f7c2', '#b8ffda'][index % 6]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, _name, payload) => [currency.format(value), payload?.payload.classification]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
        <h3 className="text-sm font-semibold text-white">Receita líquida mensal por colaborador</h3>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={monthlyCollab} margin={{ top: 24, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f272d" />
            <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis stroke="#4b5563" tickFormatter={(value) => currency.format(value).replace('R$\xa0', '')} />
            <Tooltip formatter={(value: number, name) => `${name}: ${currency.format(value)}`} />
            <Legend wrapperStyle={{ color: '#9ca3af' }} />
            {users
              .filter((user) => user.role !== 'master')
              .map((user, index) => (
                <Bar key={user.id} dataKey={user.name} fill={[ '#44c575', '#77dd9f', '#1d9c4e', '#62f5a1', '#96f7c2' ][index % 5]} radius={[12, 12, 0, 0]} />
              ))}
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-6 grid grid-cols-1 gap-3 text-xs text-zinc-400 sm:grid-cols-2 lg:grid-cols-4">
          {collaboratorSummary.slice(0, 4).map((item) => (
            <div key={item.collaborator} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-sm font-semibold text-white">{item.collaborator}</p>
              <p className="mt-2">Receita acumulada: {currency.format(item.revenue)}</p>
              <p>Negócios no período: {item.closingRate}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default ReportsPage
