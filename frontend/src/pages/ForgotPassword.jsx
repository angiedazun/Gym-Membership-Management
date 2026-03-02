import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Dumbbell, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

const API = 'http://localhost:5000'

export default function ForgotPassword() {
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]     = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post(`${API}/api/auth/forgot-password`, { email })
      setSent(true)
      toast.success('Reset link sent!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
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

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card text-center"
          >
            <div className="flex justify-center mb-4">
              <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Check Your Email</h2>
            <p className="text-zinc-400 text-sm mb-6">
              If an account with <span className="text-zinc-200 font-medium">{email}</span> exists,
              a password reset link has been sent. The link expires in 30 minutes.
            </p>
            <Link to="/login" className="btn-secondary w-full justify-center py-2.5">
              <ArrowLeft size={15} /> Back to Sign In
            </Link>
          </motion.div>
        ) : (
          <div className="card">
            <div className="flex items-center gap-2 mb-1">
              <Mail size={18} className="text-red-500" />
              <h2 className="text-xl font-black text-white">Forgot Password</h2>
            </div>
            <p className="text-zinc-500 text-sm mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <input
                  type="email"
                  className="input"
                  placeholder="admin@gym.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 text-base font-bold"
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-5 text-center">
              <Link to="/login" className="text-sm text-zinc-500 hover:text-zinc-300 inline-flex items-center gap-1.5 transition">
                <ArrowLeft size={13} /> Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
