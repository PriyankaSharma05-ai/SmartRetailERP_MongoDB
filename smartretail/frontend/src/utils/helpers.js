import { format, formatDistanceToNow } from 'date-fns'

export const formatCurrency = (n) =>
  `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const formatDate = (d) =>
  d ? format(new Date(d), 'dd MMM yyyy') : '—'

export const formatDateTime = (d) =>
  d ? format(new Date(d), 'dd MMM yyyy, hh:mm a') : '—'

export const timeAgo = (d) =>
  d ? formatDistanceToNow(new Date(d), { addSuffix: true }) : '—'

export const genInvoiceNumber = () => {
  const year = new Date().getFullYear()
  const seq  = String(Math.floor(Math.random() * 9000) + 1000)
  return `INV-${year}-${seq}`
}

export const stockStatusColor = (status) => {
  switch (status) {
    case 'OUT_OF_STOCK': return { bg: 'bg-red-500/20',    text: 'text-red-400' }
    case 'LOW_STOCK':    return { bg: 'bg-yellow-500/20', text: 'text-yellow-400' }
    default:             return { bg: 'bg-green-500/20',  text: 'text-green-400' }
  }
}

export const paymentModeColor = (mode) => {
  const map = {
    CASH:         'bg-green-500/20 text-green-400',
    UPI:          'bg-blue-500/20 text-blue-400',
    CARD:         'bg-purple-500/20 text-purple-400',
    PART_PAYMENT: 'bg-yellow-500/20 text-yellow-400',
    CREDIT:       'bg-red-500/20 text-red-400',
  }
  return map[mode] || 'bg-slate-500/20 text-slate-400'
}

export const orderStatusColor = (status) => {
  const map = {
    COMPLETED: 'bg-green-500/20 text-green-400',
    PARTIAL:   'bg-yellow-500/20 text-yellow-400',
    CANCELLED: 'bg-red-500/20 text-red-400',
    REFUNDED:  'bg-purple-500/20 text-purple-400',
  }
  return map[status] || 'bg-slate-500/20 text-slate-400'
}

export const downloadJSON = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export const exportToCSV = (rows, filename) => {
  if (!rows.length) return
  const headers = Object.keys(rows[0]).join(',')
  const csvRows = rows.map(r => Object.values(r).map(v => `"${v}"`).join(','))
  const csv     = [headers, ...csvRows].join('\n')
  const blob    = new Blob([csv], { type: 'text/csv' })
  const url     = URL.createObjectURL(blob)
  const a       = document.createElement('a')
  a.href = url; a.download = `${filename}.csv`; a.click()
  URL.revokeObjectURL(url)
}
