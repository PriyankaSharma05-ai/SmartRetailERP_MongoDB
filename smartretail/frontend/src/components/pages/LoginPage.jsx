import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm]     = useState({ username: 'admin', password: 'admin123' })
  const [loading, setLoading] = useState(false)
  const { login }           = useAuthStore()
  const navigate            = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form)
      toast.success('Welcome back! 👋')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-3xl mb-4 shadow-lg shadow-indigo-500/20">
            🏪
          </div>
          <h1 className="text-3xl font-black text-slate-100">SmartRetail</h1>
          <p className="text-slate-400 mt-1 text-sm">Complete ERP for Modern Retail</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-slate-100 mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1.5">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="Enter username"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 text-sm placeholder-slate-500 focus:border-indigo-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-semibold uppercase tracking-wide mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Enter password"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 text-sm placeholder-slate-500 focus:border-indigo-500 outline-none transition-colors"
              />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
              ) : '🔐 Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-slate-900 rounded-xl border border-slate-700">
            <div className="text-xs text-slate-500 font-bold uppercase tracking-wide mb-3">Demo Credentials</div>
            {[
              { role: 'Admin',  user: 'admin',  pass: 'admin123', color: 'text-rose-400' },
              { role: 'Owner',  user: 'owner',  pass: 'admin123', color: 'text-amber-400' },
              { role: 'Staff',  user: 'staff1', pass: 'admin123', color: 'text-emerald-400' },
            ].map(c => (
              <div key={c.role} className="flex items-center justify-between mb-2 last:mb-0">
                <span className={`text-xs font-bold ${c.color}`}>{c.role}</span>
                <button
                  onClick={() => setForm({ username: c.user, password: c.pass })}
                  className="text-xs text-slate-400 hover:text-indigo-400 transition-colors font-mono">
                  {c.user} / {c.pass}
                </button>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          SmartRetail ERP v1.0.0 · Built with Spring Boot + React
        </p>
      </div>
    </div>
  )
}
