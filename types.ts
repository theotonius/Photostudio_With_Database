
export enum ShootStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  EDITING = 'Editing'
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  eventDate: string;
  eventType: string;
  location?: string;
  image?: string;
  package: string;
  items?: InvoiceItem[];
  payments?: PaymentRecord[];
  totalPrice: number;
  paidAmount: number;
  dueAmount: number;
  status: ShootStatus;
  notes: string;
  createdAt: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  image?: string;
  notes?: string;
  createdAt: string;
}

export interface StudioProfile {
  id?: string;
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  currency: string;
  taxNumber?: string;
}

export interface DashboardStats {
  totalClients: number;
  totalRevenue: number;
  pendingPayments: number;
  upcomingShoots: number;
}
