export type ModuleKey =
  | 'dashboard'
  | 'clients'
  | 'sales'
  | 'expenses'
  | 'reports'
  | 'access';

export type UserRole = 'master' | 'gestor' | 'vendas' | 'financeiro' | 'analista';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
  allowedModules: ModuleKey[];
  lastLogin?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  origin: string;
  birthDate?: string;
  accountLink?: string;
  createdAt: string;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
}

export interface Sale {
  id: string;
  collaboratorId: string;
  clientId: string;
  productId: string;
  quantity: number;
  discountPercentage: number;
  discountValue: number;
  paymentMethod: string;
  observation?: string;
  date: string;
  subtotal: number;
  total: number;
}

export interface Expense {
  id: string;
  date: string;
  classification: string;
  description: string;
  value: number;
  createdAt: string;
}

export interface DashboardFilters {
  year: number | 'all';
  collaboratorId: string | 'all';
  clientId: string | 'all';
  productId: string | 'all';
}

export interface ModuleDefinition {
  key: ModuleKey;
  label: string;
  description: string;
  path: string;
}
