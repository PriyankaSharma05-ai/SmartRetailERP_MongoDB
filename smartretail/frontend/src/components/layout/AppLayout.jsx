import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard, ShoppingCart, Package, FileText, Users,
  Truck, BarChart3, Bot, Settings, Bell, Moon, Sun, Menu, X,
  LogOut, Store, ChevronRight
} from 'lucide-react'

const NAV_ITEMS = [
  { path: '/',           icon: LayoutDashboard, label: 'Dashboard'   },
  { path: '/pos',        icon: ShoppingCart,    label: 'POS Billing' },
  { path: '/inventory',  icon: Package,         label: 'Inventory'   },
  { path: '/orders',     icon: FileText,        label: 'Orders'      },
  { path: '/customers',  icon: Users,           label: 'Customers'   },
  { path: '/suppliers',  icon: Truck,           label: 'Suppliers'   },
  { path: '/reports',    icon: BarChart3,       label: 'Reports'     },
  { path: '/ai',         icon: Bot,             label: 'AI Assistant'},
  { path: '/settings',   icon: Settings,        label: 'Settings'    },
]

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} flex-shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-300 sticky top-0 h-screen`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-base flex-shrink-0">
            🏪
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="font-black text-slate-100 text-sm leading-tight">SmartRetail</div>
              <div className="text-indigo-400 text-xs font-bold">ERP System</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all duration-150 border-l-2 ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500 font-bold'
                    : 'text-slate-400 border-transparent hover:bg-slate-800 hover:text-slate-200 font-medium'
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span className="whitespace-nowrap">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="border-t border-slate-800 px-3 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <div className="text-sm font-bold text-slate-200 truncate">{user?.fullName || 'Admin'}</div>
                <div className="text-xs text-indigo-400 font-semibold truncate">
                  {user?.roles?.[0]?.replace('ROLE_', '') || 'Admin'}
                </div>
              </div>
            )}
            {sidebarOpen && (
              <button onClick={logout} className="text-slate-500 hover:text-rose-400 transition-colors ml-auto">
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(s => !s)}
              className="text-slate-400 hover:text-slate-200 transition-colors">
              <Menu size={20} />
            </button>
            <div>
              <div className="font-black text-slate-100 text-base leading-tight">SmartRetail ERP</div>
              <div className="text-xs text-slate-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors relative">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            </button>
            <button onClick={() => setDarkMode(d => !d)}
              className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors">
              {darkMode ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-400 font-bold">Live</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
