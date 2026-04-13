import { useEffect, useState } from 'react'
import { dashboardAPI } from '../../services/api'
import { useAuthStore } from '../../store/authStore'
import { formatCurrency, formatDateTime } from '../../utils/helpers'
import { KpiCard, Card, Badge, Spinner } from '../common/UI'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle, Package, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const COLORS = ['#6366f1','#10b981','#f59e0b','#f43f5e','#3b82f6','#8b5cf6']

export default function DashboardPage() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const { storeId }         = useAuthStore()

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [storeId])

  const loadStats = async () => {
    try {
      const res = await dashboardAPI.getStats(storeId)
      setStats(res.data.data)
    } catch {
      // fallback to mock data if backend not running
      setStats(getMockStats())
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64"><Spinner size={32} /></div>
  )

  const s = stats

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-indigo-900/60 via-slate-800 to-slate-800 rounded-2xl p-7 border border-indigo-500/20 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(99,102,241,0.15) 0%, transparent 60%)' }} />
        <div className="relative">
          <div className="text-xs text-indigo-400 font-bold uppercase tracking-widest mb-2">SmartRetail ERP · Live Dashboard</div>
          <h1 className="text-2xl font-black text-slate-100 mb-1">
            Good {getGreeting()}, <span className="text-gradient">Admin</span> 👋
          </h1>
          <p className="text-slate-400 text-sm">
            Today's revenue is <span className="text-emerald-400 font-bold">{formatCurrency(s?.todayRevenue || 0)}</span>
            {' '}· {s?.todayOrders || 0} orders processed today
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Today's Revenue"  value={formatCurrency(s?.todayRevenue)}  trend="+18%"  sub="vs yesterday" icon={DollarSign}    color="#10b981" />
        <KpiCard label="Today's Orders"   value={s?.todayOrders || 0}             trend="+12%"  sub="this week"   icon={ShoppingBag}    color="#6366f1" />
        <KpiCard label="Today's Profit"   value={formatCurrency(s?.todayProfit)}  trend="+8%"   sub="gross"       icon={TrendingUp}     color="#f59e0b" />
        <KpiCard label="Low Stock Alerts" value={s?.lowStockCount || 0}           trend="⚠ Act" sub="items"       icon={AlertTriangle}  color="#f43f5e" />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Total Products"  value={s?.totalProducts || 0}         sub="active"       icon={Package}   color="#3b82f6" />
        <KpiCard label="Out of Stock"    value={s?.outOfStockCount || 0}       sub="items"        icon={Package}   color="#f43f5e" />
        <KpiCard label="Total Customers" value={s?.totalCustomers || 0}        sub="registered"   icon={Users}     color="#8b5cf6" />
        <KpiCard label="Pending Due"     value={formatCurrency(s?.pendingDue)} sub="to collect"   icon={DollarSign} color="#f59e0b" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4">
        {/* Weekly Sales Bar Chart */}
        <Card className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-100">Weekly Revenue Overview</h3>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"/>Revenue</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Profit</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={s?.weeklySales || getMockWeekly()} barGap={4}>
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={d => d?.slice(5)} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4,4,0,0]} />
              <Bar dataKey="profit"  fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Pie Chart */}
        <Card>
          <h3 className="font-bold text-slate-100 mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={s?.categorySales || getMockCategories()} dataKey="revenue" nameKey="category"
                cx="50%" cy="50%" innerRadius={35} outerRadius={65}>
                {(s?.categorySales || getMockCategories()).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {(s?.categorySales || getMockCategories()).slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-xs text-slate-400 truncate">{c.category}</span>
                </div>
                <span className="text-xs font-bold text-slate-200">{c.percentage?.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Low Stock + Recent Orders */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <h3 className="font-bold text-slate-100 mb-4">⚠️ Low Stock Alerts</h3>
          <div className="space-y-3">
            {(s?.lowStockAlerts || getMockLowStock()).map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-base">📦</div>
                  <div>
                    <div className="text-sm font-semibold text-slate-200 truncate max-w-40">{p.name}</div>
                    <div className="text-xs text-slate-500">Min: {p.minQuantity} units</div>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${p.stockStatus === 'OUT_OF_STOCK' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {p.stockStatus === 'OUT_OF_STOCK' ? 'Out of Stock' : `${p.stockQuantity} left`}
                </span>
              </div>
            ))}
            {!s?.lowStockAlerts?.length && !getMockLowStock().length && (
              <div className="text-center py-6 text-slate-500 text-sm">✅ All items are well-stocked</div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-slate-100 mb-4">🧾 Recent Orders</h3>
          <div className="space-y-3">
            {(s?.recentOrders || getMockOrders()).map((o, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                <div>
                  <div className="text-sm font-bold text-indigo-400 font-mono">{o.invoiceNumber}</div>
                  <div className="text-xs text-slate-500">{o.customerName || 'Walk-in'}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400">{formatCurrency(o.totalAmount)}</div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${o.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

// Helpers
const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

// Fallback mock data when backend is not connected
const getMockStats = () => ({
  todayRevenue: 18450, weekRevenue: 89200, monthRevenue: 342000,
  todayProfit: 4820, todayOrders: 42, totalProducts: 10,
  lowStockCount: 3, outOfStockCount: 1, totalCustomers: 4, pendingDue: 264,
  weeklySales: getMockWeekly(), categorySales: getMockCategories(),
  lowStockAlerts: getMockLowStock(), recentOrders: getMockOrders(),
})
const getMockWeekly = () => [
  { date:'2025-07-04', revenue:8420, profit:2200, orders:24 },
  { date:'2025-07-05', revenue:11200, profit:3100, orders:31 },
  { date:'2025-07-06', revenue:9800, profit:2650, orders:28 },
  { date:'2025-07-07', revenue:13400, profit:3900, orders:38 },
  { date:'2025-07-08', revenue:15600, profit:4800, orders:45 },
  { date:'2025-07-09', revenue:18900, profit:5600, orders:54 },
  { date:'2025-07-10', revenue:18450, profit:4820, orders:42 },
]
const getMockCategories = () => [
  { category:'Grains', revenue:32000, percentage:32 },
  { category:'Dairy', revenue:18000, percentage:18 },
  { category:'Personal Care', revenue:20000, percentage:20 },
  { category:'Household', revenue:15000, percentage:15 },
  { category:'Others', revenue:15000, percentage:15 },
]
const getMockLowStock = () => [
  { name:'Amul Butter 500g', stockQuantity:8, minQuantity:15, stockStatus:'LOW_STOCK' },
  { name:'Surf Excel 1kg', stockQuantity:0, minQuantity:20, stockStatus:'OUT_OF_STOCK' },
  { name:'Lifebuoy Soap 4pk', stockQuantity:12, minQuantity:25, stockStatus:'LOW_STOCK' },
]
const getMockOrders = () => [
  { invoiceNumber:'INV-2025-0001', customerName:'Priya Sharma', totalAmount:909, status:'COMPLETED' },
  { invoiceNumber:'INV-2025-0002', customerName:'Walk-in', totalAmount:489, status:'COMPLETED' },
  { invoiceNumber:'INV-2025-0003', customerName:'Rahul Kumar', totalAmount:1264, status:'PARTIAL' },
]
