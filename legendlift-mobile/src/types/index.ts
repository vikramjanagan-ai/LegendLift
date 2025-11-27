// Type Definitions for LegendLift App

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'technician';
  profileImage?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface Customer {
  id: string;
  jobNumber: string;
  name: string;
  area: string;
  address: string;
  contactPerson: string;
  phone: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  route: number;
  createdAt: string;
  updatedAt: string;
}

export interface AMCContract {
  id: string;
  customerId: string;
  customer?: Customer;
  contractType: 'Active' | 'Warranty' | 'Renewal' | 'Closed';
  startDate: string;
  endDate: string;
  serviceFrequency: 'monthly' | 'bi_monthly' | 'quarterly' | 'half_yearly' | 'yearly';
  totalServices: number;
  completedServices: number;
  pendingServices: number;
  amount: number;
  terms?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceSchedule {
  id: string;
  contractId: string;
  contract?: AMCContract;
  customerId: string;
  customer?: Customer;
  scheduledDate: string;
  actualDate?: string;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  technicianId?: string;
  technician?: User;
  technician2Id?: string;
  technician2?: User;
  daysOverdue?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceReport {
  id: string;
  serviceId: string;
  service?: ServiceSchedule;
  technicianId: string;
  technician?: User;
  checkInTime: string;
  checkOutTime?: string;
  checkInLocation?: {
    latitude: number;
    longitude: number;
  };
  checkOutLocation?: {
    latitude: number;
    longitude: number;
  };
  workDone: string;
  partsReplaced?: string[];
  images?: string[];
  customerSignature?: string;
  technicianSignature?: string;
  customerFeedback?: string;
  rating?: number;
  completionTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  customerId: string;
  customer?: Customer;
  contractId: string;
  contract?: AMCContract;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  followUpDate?: string;
  followUpNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: number;
  name: string;
  assignedTechnicianId?: string;
  assignedTechnician?: User;
  customerCount: number;
  activeContracts: number;
}

export interface Escalation {
  id: string;
  customerId: string;
  customer?: Customer;
  issueType: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  raisedBy: string;
  raisedDate: string;
  assignedToId?: string;
  assignedTo?: User;
  resolvedDate?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalCustomers: number;
  activeContracts: number;
  pendingServices: number;
  completedServicesToday: number;
  overdueServices: number;
  pendingPayments: number;
  totalRevenue: number;
  technicianCount: number;
  completionRate: number;
}

export interface TechnicianDashboardStats {
  todayServices: number;
  completedToday: number;
  pendingServices: number;
  totalCompleted: number;
  averageRating: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'service' | 'payment' | 'escalation' | 'general';
  read: boolean;
  data?: any;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter and Search Types
export interface ServiceFilter {
  status?: string[];
  route?: number[];
  dateFrom?: string;
  dateTo?: string;
  technicianId?: string;
  customerId?: string;
}

export interface CustomerFilter {
  route?: number[];
  contractType?: string[];
  area?: string;
  search?: string;
}

export interface PaymentFilter {
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  role: 'admin' | 'technician';
}

export interface CustomerForm {
  jobNumber: string;
  name: string;
  area: string;
  address: string;
  contactPerson: string;
  phone: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  route: number;
}

export interface ContractForm {
  customerId: string;
  contractType: 'Active' | 'Warranty' | 'Renewal' | 'Closed';
  startDate: string;
  endDate: string;
  serviceFrequency: 'monthly' | 'bi_monthly' | 'quarterly' | 'half_yearly' | 'yearly';
  totalServices: number;
  amount: number;
  terms?: string;
  notes?: string;
}

export interface ServiceReportForm {
  serviceId: string;
  workDone: string;
  partsReplaced?: string[];
  images?: string[];
  customerSignature?: string;
  technicianSignature?: string;
  customerFeedback?: string;
  rating?: number;
}

// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  OTPVerification: { email: string };
};

export type AdminStackParamList = {
  AdminDashboard: undefined;
  Customers: undefined;
  CustomerDetails: { customerId: string };
  AddCustomer: undefined;
  EditCustomer: { customerId: string };
  Contracts: undefined;
  ContractDetails: { contractId: string };
  AddContract: { customerId?: string };
  EditContract: { contractId: string };
  Services: undefined;
  ServiceDetails: { serviceId: string };
  ServiceCalendar: undefined;
  AssignService: { serviceId: string };
  Routes: undefined;
  RouteDetails: { routeId: number };
  Payments: undefined;
  PaymentDetails: { paymentId: string };
  PaymentFollowUp: undefined;
  Reports: undefined;
  Technicians: undefined;
  TechnicianDetails: { technicianId: string };
  AddTechnician: undefined;
  Escalations: undefined;
  EscalationDetails: { escalationId: string };
  Settings: undefined;
  Profile: undefined;
};

export type TechnicianStackParamList = {
  TechnicianDashboard: undefined;
  TodayServices: undefined;
  ServiceDetails: { serviceId: string };
  ExecuteService: { serviceId: string };
  ServiceHistory: undefined;
  RouteMap: undefined;
  Profile: undefined;
  Notifications: undefined;
};

export type AdminTabParamList = {
  Dashboard: undefined;
  Services: undefined;
  Customers: undefined;
  Payments: undefined;
  More: undefined;
};

export type TechnicianTabParamList = {
  Dashboard: undefined;
  Services: undefined;
  History: undefined;
  Profile: undefined;
};
