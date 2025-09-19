import type { Client, Expense, ModuleDefinition, ModuleKey, Product, Sale, UserAccount } from '../types'

export const MODULES: ModuleDefinition[] = [
  {
    key: 'dashboard',
    label: 'Painel Analítico',
    description: 'Resumo de vendas, despesas e performance.',
    path: '/',
  },
  {
    key: 'clients',
    label: 'Clientes',
    description: 'Cadastro, edição e histórico dos clientes.',
    path: '/clientes',
  },
  {
    key: 'sales',
    label: 'Vendas',
    description: 'Registro de vendas e acompanhamento comercial.',
    path: '/vendas',
  },
  {
    key: 'expenses',
    label: 'Despesas',
    description: 'Controle das saídas financeiras.',
    path: '/despesas',
  },
  {
    key: 'reports',
    label: 'Visão Analítica',
    description: 'Insights adicionais e rankings.',
    path: '/relatorios',
  },
  {
    key: 'access',
    label: 'Controle de Acesso',
    description: 'Gerenciamento de usuários e permissões.',
    path: '/acessos',
  },
]

export const MASTER_ALLOWED: ModuleKey[] = MODULES.map((module) => module.key)

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'u-master',
    name: 'Mariana Correia',
    email: 'master@fnvj.com.br',
    password: 'verde123',
    role: 'master',
    active: true,
    allowedModules: MASTER_ALLOWED,
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'u-gestor',
    name: 'Rafael Martins',
    email: 'rafael@fnvj.com.br',
    password: 'gestao2025',
    role: 'gestor',
    active: true,
    allowedModules: ['dashboard', 'clients', 'sales', 'reports'],
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'u-vendas-1',
    name: 'Aline Souza',
    email: 'aline@fnvj.com.br',
    password: 'vendas123',
    role: 'vendas',
    active: true,
    allowedModules: ['dashboard', 'sales', 'clients'],
  },
  {
    id: 'u-financas',
    name: 'João Henrique',
    email: 'joao@fnvj.com.br',
    password: 'financas!',
    role: 'financeiro',
    active: true,
    allowedModules: ['dashboard', 'expenses', 'reports'],
  },
  {
    id: 'u-analista',
    name: 'Beatriz Lima',
    email: 'beatriz@fnvj.com.br',
    password: 'analytics',
    role: 'analista',
    active: true,
    allowedModules: ['dashboard', 'reports'],
  },
]

export const DEFAULT_CLIENTS: Client[] = [
  {
    id: 'c-1',
    name: 'Marcelo Geronimo da Silva Nascimento',
    email: 'marcelo.nascimento@email.com',
    phone: '(11) 91234-5678',
    document: '123.456.789-00',
    origin: 'Indicação',
    birthDate: '1987-03-12',
    accountLink: 'https://instagram.com/marcelo',
    createdAt: '2024-01-10T10:00:00.000Z',
  },
  {
    id: 'c-2',
    name: 'Ana Paula Soares de Oliveira',
    email: 'ana.soares@email.com',
    phone: '(21) 99876-5432',
    document: '987.654.321-00',
    origin: 'Evento',
    birthDate: '1990-08-25',
    accountLink: 'https://linkedin.com/in/anapaula',
    createdAt: '2024-02-15T15:30:00.000Z',
  },
  {
    id: 'c-3',
    name: 'Pedro Lucas da Silva',
    email: 'pedro.lucas@email.com',
    phone: '(31) 91111-2233',
    document: '321.654.987-00',
    origin: 'Campanha Digital',
    birthDate: '1995-11-02',
    accountLink: 'https://facebook.com/pedrolucas',
    createdAt: '2024-03-21T09:45:00.000Z',
  },
  {
    id: 'c-4',
    name: 'Giovana Ferreira',
    email: 'giovana.ferreira@email.com',
    phone: '(47) 97777-8899',
    document: '222.333.444-55',
    origin: 'Orgânico',
    birthDate: '1989-05-08',
    accountLink: 'https://instagram.com/giovana',
    createdAt: '2024-04-12T11:20:00.000Z',
  },
  {
    id: 'c-5',
    name: 'Cristian Lucas De Sousa',
    email: 'cristian.sousa@email.com',
    phone: '(62) 93333-4455',
    document: '789.123.456-77',
    origin: 'Parceria',
    birthDate: '1992-01-17',
    accountLink: 'https://instagram.com/cristian',
    createdAt: '2024-05-05T16:05:00.000Z',
  },
]

export const DEFAULT_PRODUCTS: Product[] = [
  { id: 'p-1', name: 'Consultoria Financeira Essencial', category: 'Consultoria', price: 1290 },
  { id: 'p-2', name: 'Mentoria Premium', category: 'Mentoria', price: 2490 },
  { id: 'p-3', name: 'Planejamento Fiscal Anual', category: 'Planejamento', price: 1890 },
  { id: 'p-4', name: 'Workshop Educação Financeira', category: 'Treinamento', price: 890 },
]

const sale = (
  id: string,
  collaboratorId: string,
  clientId: string,
  productId: string,
  quantity: number,
  discountPercentage: number,
  discountValue: number,
  paymentMethod: string,
  observation: string | undefined,
  date: string,
  products: Product[],
): Sale => {
  const product = products.find((item) => item.id === productId)
  const subtotal = (product?.price ?? 0) * quantity
  const total = subtotal - subtotal * (discountPercentage / 100) - discountValue
  return {
    id,
    collaboratorId,
    clientId,
    productId,
    quantity,
    discountPercentage,
    discountValue,
    paymentMethod,
    observation,
    date,
    subtotal,
    total,
  }
}

const products = DEFAULT_PRODUCTS

export const DEFAULT_SALES: Sale[] = [
  sale('s-1', 'u-vendas-1', 'c-1', 'p-2', 1, 5, 0, 'Cartão de Crédito', 'Renovação anual', '2024-05-18', products),
  sale('s-2', 'u-gestor', 'c-2', 'p-1', 1, 0, 150, 'Pix', 'Pacote customizado', '2024-06-03', products),
  sale('s-3', 'u-vendas-1', 'c-3', 'p-4', 3, 0, 0, 'Boleto', 'Treinamento corporativo', '2024-07-22', products),
  sale('s-4', 'u-gestor', 'c-4', 'p-3', 2, 10, 0, 'Transferência', 'Projeto de expansão', '2024-08-11', products),
  sale('s-5', 'u-analista', 'c-5', 'p-2', 1, 0, 0, 'Cartão de Crédito', 'Upgrade de plano', '2024-09-05', products),
  sale('s-6', 'u-vendas-1', 'c-1', 'p-1', 1, 0, 0, 'Pix', 'Onboarding consultoria', '2024-10-13', products),
]

export const DEFAULT_EXPENSES: Expense[] = [
  {
    id: 'e-1',
    date: '2024-05-20',
    classification: 'Marketing',
    description: 'Campanha redes sociais',
    value: 3200,
    createdAt: '2024-05-20T14:00:00.000Z',
  },
  {
    id: 'e-2',
    date: '2024-06-10',
    classification: 'Operacional',
    description: 'Assinaturas de softwares',
    value: 890,
    createdAt: '2024-06-10T09:15:00.000Z',
  },
  {
    id: 'e-3',
    date: '2024-07-05',
    classification: 'Comissão',
    description: 'Bonificação equipe comercial',
    value: 5400,
    createdAt: '2024-07-05T18:22:00.000Z',
  },
  {
    id: 'e-4',
    date: '2024-08-18',
    classification: 'Eventos',
    description: 'Organização workshop clientes',
    value: 2500,
    createdAt: '2024-08-18T11:40:00.000Z',
  },
]
