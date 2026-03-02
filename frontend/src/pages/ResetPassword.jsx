import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Dumbbell, Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

const API = 'http://localhost:5000'

export default function ResetPassword() {
  const { token }            = useParams()
  const navigate             = useNavigate()
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [showCf, setShowCf]       = useState(false)
  const [loading, setLoading]     = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await axios.post(`${API}/api/auth/reset-password/${token}`, { password })
      toast.success('Password reset! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired reset link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-800 via-red-600 to-red-800" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-900 mb-3">
            <Dumbbell size={28} className="text-white" />
          </div>
          <span className="text-xl font-black text-white">Combat Fitness</span>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <Lock size={18} className="text-red-500" />
            <h2 className="text-xl font-black text-white">Set New Password</h2>
          </div>
          <p className="text-zinc-500 text-sm mb-6">Create a strong password for your account.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <input
                  type={showCf ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Repeat new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowCf(!showCf)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Strength hint */}
            {password && (
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                    password.length > i * 3
                      ? password.length >= 12 ? 'bg-green-500' : password.length >= 8 ? 'bg-yellow-500' : 'bg-red-500'
                      : 'bg-zinc-800'
                  }`} />
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base font-bold"
            >
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link to="/login" className="text-sm text-zinc-500 hover:text-zinc-300 inline-flex items-center gap-1.5 transition">
              <ArrowLeft size={13} /> Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
