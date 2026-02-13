
export enum ShootStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  EDITING = 'Editing'
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  eventDate: string;
  eventType: string;
  package: string;
  totalPrice: number;
  paidAmount: number;
  status: ShootStatus;
  notes: string;
  createdAt: string;
}

export interface DashboardStats {
  totalClients: number;
  totalRevenue: number;
  pendingPayments: number;
  upcomingShoots: number;
}
