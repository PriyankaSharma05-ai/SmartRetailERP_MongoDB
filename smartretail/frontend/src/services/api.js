import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:    (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
}

// ── Products ──────────────────────────────────────────────────────────────────
export const productAPI = {
  getAll:       (storeId) => api.get('/api/products', { params: { storeId } }),
  getById:      (id)      => api.get(`/api/products/${id}`),
  getByBarcode: (barcode) => api.get(`/api/products/barcode/${barcode}`),
  search:       (q)       => api.get('/api/products/search', { params: { q } }),
  create:       (data)    => api.post('/api/products', data),
  update:       (id, data)=> api.put(`/api/products/${id}`, data),
  delete:       (id)      => api.delete(`/api/products/${id}`),
  getLowStock:  (storeId) => api.get('/api/products/low-stock', { params: { storeId } }),
  getLossItems: ()        => api.get('/api/products/loss-items'),
  adjustStock:  (data)    => api.post('/api/products/stock/adjust', data),
}

// ── Orders ────────────────────────────────────────────────────────────────────
export const orderAPI = {
  create:         (data)            => api.post('/api/orders', data),
  getByStore:     (storeId)         => api.get('/api/orders', { params: { storeId } }),
  getByInvoice:   (invoiceNumber)   => api.get(`/api/orders/${invoiceNumber}`),
  getByCustomer:  (customerId)      => api.get(`/api/orders/customer/${customerId}`),
  getByDateRange: (storeId, from, to) => api.get('/api/orders/date-range', { params: { storeId, from, to } }),
  getPendingDue:  (storeId)         => api.get('/api/orders/pending-due', { params: { storeId } }),
  processReturn:  (orderId, productId, quantity, reason) =>
    api.post(`/api/orders/${orderId}/return`, null, { params: { productId, quantity, reason } }),
}

// ── Customers ─────────────────────────────────────────────────────────────────
export const customerAPI = {
  getAll:  ()        => api.get('/api/customers'),
  getById: (id)      => api.get(`/api/customers/${id}`),
  search:  (q)       => api.get('/api/customers/search', { params: { q } }),
  create:  (data)    => api.post('/api/customers', data),
  update:  (id, data)=> api.put(`/api/customers/${id}`, data),
}

// ── Suppliers ─────────────────────────────────────────────────────────────────
export const supplierAPI = {
  getAll:         ()           => api.get('/api/suppliers'),
  getById:        (id)         => api.get(`/api/suppliers/${id}`),
  create:         (data)       => api.post('/api/suppliers', data),
  update:         (id, data)   => api.put(`/api/suppliers/${id}`, data),
  recordPayment:  (id, amount) => api.post(`/api/suppliers/${id}/payment`, null, { params: { amount } }),
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: (storeId) => api.get('/api/dashboard', { params: { storeId } }),
}

// ── Reports ───────────────────────────────────────────────────────────────────
export const reportAPI = {
  getReport: (storeId, from, to) => api.get('/api/reports', { params: { storeId, from, to } }),
}

export default api
