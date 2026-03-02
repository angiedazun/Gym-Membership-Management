import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Dumbbell, Eye, EyeOff, Zap, Shield, Activity, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

const FEATURES = [
  { icon: Shield,     text: 'Secure member management' },
  { icon: Activity,   text: 'Real-time attendance tracking' },
  { icon: TrendingUp, text: 'Revenue & analytics reporting' },
  { icon: Zap,        text: 'Fast payment processing' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 w-[480px] shrink-0 relative overflow-hidden bg-zinc-900 border-r border-zinc-800">
        {/* Decorative glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-red-700/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-0 w-56 h-56 bg-red-900/20 rounded-full blur-2xl" />
        </div>

        {/* Red bar accent at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-800 via-red-600 to-red-800" />

        <div className="relative z-10">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-14">
            <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-900">
              <Dumbbell size={28} className="text-white" />
            </div>
            <div>
              <span className="text-2xl font-black text-white tracking-tight block leading-tight">Combat Fitness</span>

            </div>
          </div>

          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Train Hard.<br />
            <span className="text-red-500">Manage Smarter.</span>
          </h1>
          <p className="text-zinc-400 text-sm mb-10 leading-relaxed">
            Professional gym management platform for elite fitness centres.
          </p>

          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-800/50 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-red-400" />
                </div>
                <span className="text-zinc-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom badge */}
        <div className="absolute bottom-6 left-16 right-16">
          <p className="text-xs text-zinc-600 text-center">Powered by Combat Fitness Management System</p>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-zinc-950">
        {/* Top red accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-800 via-red-600 to-red-800 lg:hidden" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center gap-2 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-900">
              <Dumbbell size={26} className="text-white" />
            </div>
            <span className="text-xl font-black text-white">Combat Fitness</span>
          </div>

          <h2 className="text-2xl font-black text-white mb-1">Sign In</h2>
          <p className="text-zinc-500 text-sm mb-8">Access your management dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" placeholder="admin@gym.lk"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-10" placeholder="••••••••"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button type="submit" disabled={loading}
                className="btn-primary flex-1 justify-center py-3 text-base mt-2 font-bold tracking-wide">
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-sm text-zinc-500 hover:text-red-400 transition">
              Forgot your password?
            </Link>
          </div>

          <div className="mt-6 p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
            <p className="text-xs font-bold text-red-500 mb-2 uppercase tracking-wide">Demo credentials</p>
            <p className="text-xs text-zinc-400">Email: <span className="text-zinc-200">admin@gym.lk</span></p>
            <p className="text-xs text-zinc-400 mt-1">Password: <span className="text-zinc-200">admin123</span></p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
