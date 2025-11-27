export * from './theme';

// API Configuration
// Using LocalTunnel for cross-network access
export const API_CONFIG = {
  BASE_URL: 'https://turbo-trusts-voltage-connections.trycloudflare.com/api/v1',
  TIMEOUT: 30000,
  DEFAULT_HEADERS: {
    'Bypass-Tunnel-Reminder': 'true',
    'Content-Type': 'application/json',
    'User-Agent': 'LegendLift-Mobile-App',
  },
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  TECHNICIAN: 'technician',
  CUSTOMER: 'customer',
};

// AMC Status
export const AMC_STATUS = {
  ACTIVE: 'Active',
  WARRANTY: 'Warranty',
  RENEWAL: 'Renewal',
  CLOSED: 'Closed',
};

// Service Status
export const SERVICE_STATUS = {
  PENDING: 'pending',
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
};

// Service Frequency
export const SERVICE_FREQUENCY = {
  MONTHLY: 'monthly',
  BI_MONTHLY: 'bi_monthly',
  QUARTERLY: 'quarterly',
  HALF_YEARLY: 'half_yearly',
  YEARLY: 'yearly',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  PARTIAL: 'partial',
};

// Routes
export const ROUTES = [
  { id: 1, name: 'Route 1' },
  { id: 2, name: 'Route 2' },
  { id: 3, name: 'Route 3' },
  { id: 4, name: 'Route 4' },
  { id: 5, name: 'Route 5' },
];

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@legendlift:auth_token',
  USER_DATA: '@legendlift:user_data',
  USER_ROLE: '@legendlift:user_role',
  OFFLINE_SERVICES: '@legendlift:offline_services',
  PENDING_SYNC: '@legendlift:pending_sync',
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD MMM YYYY',
  DISPLAY_WITH_TIME: 'DD MMM YYYY, hh:mm A',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DD HH:mm:ss',
  TIME: 'hh:mm A',
  MONTH_YEAR: 'MMM YYYY',
};

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[6-9]\d{9}$/,
  PASSWORD_MIN_LENGTH: 6,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_LATITUDE: 13.0827,
  DEFAULT_LONGITUDE: 80.2707,
  DEFAULT_ZOOM: 12,
  MARKER_COLORS: {
    PENDING: '#FFB74D',
    COMPLETED: '#66BB6A',
    IN_PROGRESS: '#29B6F6',
  },
};
