export const COLORS = {
  primary: '#00FFEF',
  secondary: '#1A1F35',
  background: '#0D1117',
  surface: 'rgba(26, 31, 53, 0.9)',
  text: 'rgba(255, 255, 255, 0.9)',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  white: '#FFFFFF',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  info: '#007AFF',
};

export const API_CONFIG = {
  baseUrl: 'http://192.168.100.2:8000/api', // Cambia esto según tu configuración
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export const QUERY_TYPES = {
  BEST_SALES: 'best_sales',
  TOP_SELLER: 'top_seller',
  TOP_PRODUCTS: 'top_products',
  SALES_BY_BRANCH: 'sales_by_branch',
  SUMMARY: 'summary',
  TREND: 'trend',
  COMPARISON: 'comparison',
  HELP: 'help',
};

export const PERIODS = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
  ALL: 'all',
};

export const EXPORT_FORMATS = {
  EXCEL: 'excel',
  PDF: 'pdf',
};