import { createContext, useCallback, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import {
  DEFAULT_CLIENTS,
  DEFAULT_EXPENSES,
  DEFAULT_PRODUCTS,
  DEFAULT_SALES,
} from '../data/initialData'
import type { Client, Expense, Product, Sale } from '../types'
import { usePersistentState } from '../hooks/usePersistentState'

interface ClientPayload extends Omit<Client, 'id' | 'createdAt'> {
  id?: string
}

interface SalePayload extends Omit<Sale, 'id' | 'subtotal' | 'total'> {
  id?: string
}

interface ExpensePayload extends Omit<Expense, 'id' | 'createdAt'> {
  id?: string
}

interface DataContextValue {
  clients: Client[]
  sales: Sale[]
  expenses: Expense[]
  products: Product[]
  upsertClient: (payload: ClientPayload) => Client
  upsertSale: (payload: SalePayload) => Sale
  upsertExpense: (payload: ExpensePayload) => Expense
  removeSale: (id: string) => void
  removeClient: (id: string) => void
  removeExpense: (id: string) => void
  getClientById: (id: string) => Client | undefined
  getProductById: (id: string) => Product | undefined
}

const DataContext = createContext<DataContextValue | undefined>(undefined)

const CLIENT_STORAGE = 'fnvj:clients'
const SALE_STORAGE = 'fnvj:sales'
const EXPENSE_STORAGE = 'fnvj:expenses'
const PRODUCT_STORAGE = 'fnvj:products'

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2, 11)}`

const computeTotals = (sale: SalePayload, products: Product[]): Pick<Sale, 'subtotal' | 'total'> => {
  const product = products.find((item) => item.id === sale.productId)
  const subtotal = (product?.price ?? 0) * sale.quantity
  const discountFromPercentage = subtotal * (sale.discountPercentage / 100)
  const total = subtotal - discountFromPercentage - sale.discountValue
  return { subtotal, total }
}

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [clients, setClients] = usePersistentState<Client[]>(CLIENT_STORAGE, DEFAULT_CLIENTS)
  const [sales, setSales] = usePersistentState<Sale[]>(SALE_STORAGE, DEFAULT_SALES)
  const [expenses, setExpenses] = usePersistentState<Expense[]>(EXPENSE_STORAGE, DEFAULT_EXPENSES)
  const [products] = usePersistentState<Product[]>(PRODUCT_STORAGE, DEFAULT_PRODUCTS)

  const upsertClient = useCallback(
    (payload: ClientPayload) => {
      if (payload.id) {
        setClients((prev) =>
          prev.map((client) =>
            client.id === payload.id
              ? {
                  ...client,
                  ...payload,
                }
              : client,
          ),
        )
        return {
          ...(clients.find((client) => client.id === payload.id) ?? (payload as Client)),
          ...payload,
        }
      }

      const client: Client = {
        ...payload,
        id: generateId(),
        createdAt: new Date().toISOString(),
      }
      setClients((prev) => [...prev, client])
      return client
    },
    [clients, setClients],
  )

  const upsertSale = useCallback(
    (payload: SalePayload) => {
      const totals = computeTotals(payload, products)
      if (payload.id) {
        const sale: Sale = { ...payload, ...totals } as Sale
        setSales((prev) => prev.map((item) => (item.id === payload.id ? sale : item)))
        return sale
      }

      const sale: Sale = {
        ...payload,
        id: generateId(),
        ...totals,
      }
      setSales((prev) => [...prev, sale])
      return sale
    },
    [products, setSales],
  )

  const upsertExpense = useCallback(
    (payload: ExpensePayload) => {
      if (payload.id) {
        const expense: Expense = {
          ...payload,
          id: payload.id,
          createdAt:
            expenses.find((item) => item.id === payload.id)?.createdAt ?? new Date().toISOString(),
        }
        setExpenses((prev) => prev.map((item) => (item.id === payload.id ? expense : item)))
        return expense
      }

      const expense: Expense = {
        ...payload,
        id: generateId(),
        createdAt: new Date().toISOString(),
      }
      setExpenses((prev) => [...prev, expense])
      return expense
    },
    [expenses, setExpenses],
  )

  const removeSale = useCallback(
    (id: string) => setSales((prev) => prev.filter((item) => item.id !== id)),
    [setSales],
  )

  const removeClient = useCallback(
    (id: string) => {
      setClients((prev) => prev.filter((client) => client.id !== id))
      setSales((prev) => prev.filter((sale) => sale.clientId !== id))
    },
    [setClients, setSales],
  )

  const removeExpense = useCallback(
    (id: string) => setExpenses((prev) => prev.filter((item) => item.id !== id)),
    [setExpenses],
  )

  const getClientById = useCallback((id: string) => clients.find((client) => client.id === id), [clients])

  const getProductById = useCallback(
    (id: string) => products.find((product) => product.id === id),
    [products],
  )

  const value = useMemo(
    () => ({
      clients,
      sales,
      expenses,
      products,
      upsertClient,
      upsertSale,
      upsertExpense,
      removeSale,
      removeClient,
      removeExpense,
      getClientById,
      getProductById,
    }),
    [
      clients,
      expenses,
      getClientById,
      getProductById,
      products,
      removeClient,
      removeExpense,
      removeSale,
      sales,
      upsertClient,
      upsertExpense,
      upsertSale,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData deve ser utilizado dentro do DataProvider')
  }
  return context
}
