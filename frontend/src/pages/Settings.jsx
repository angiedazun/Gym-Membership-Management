import { useEffect, useState } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Save, Lock, Users, Plus, Trash2, Shield, Building2 } from 'lucide-react'
import { motion } from 'framer-motion'

const Section = ({ icon: Icon, title, desc, children }) => (
  <div className="card space-y-4">
    <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
      <div className="w-9 h-9 bg-red-950 rounded-xl flex items-center justify-center">
        <Icon size={17} className="text-red-500" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-zinc-100">{title}</h3>
        {desc && <p className="text-xs text-zinc-500 mt-0.5">{desc}</p>}
      </div>
    </div>
    {children}
  </div>
)

export default function Settings() {
  const { user }  = useAuth()

  // Password change
  const [pwForm,    setPwForm]    = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)

  // Staff
  const [staff,    setStaff]    = useState([])
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'staff' })
  const [adding,   setAdding]   = useState(false)
  const [showAdd,  setShowAdd]  = useState(false)

  const loadStaff = () => {
    api.get('/users').then(({ data }) => setStaff(data.users || [])).catch(() => {})
  }

  useEffect(() => { loadStaff() }, [])

  const handlePwChange = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setPwLoading(true)
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      })
      toast.success('Password changed successfully!')
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setPwLoading(false)
    }
  }

  const handleAddStaff = async (e) => {
    e.preventDefault()
    setAdding(true)
    try {
      await api.post('/users', newStaff)
      toast.success('Staff account created!')
      setNewStaff({ name: '', email: '', password: '', role: 'staff' })
      setShowAdd(false)
      loadStaff()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account')
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteStaff = async (id, name) => {
    if (!confirm(`Remove staff account "${name}"?`)) return
    try {
      await api.delete(`/users/${id}`)
      toast.success('Staff removed')
      loadStaff()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove')
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-black text-white">Settings</h2>
        <p className="text-sm text-zinc-500 mt-0.5">Manage your account and staff</p>
      </div>

      {/* Current User Info */}
      <Section icon={Shield} title="Your Account" desc="Currently signed in account details">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
               style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {user?.name?.[0] || 'A'}
          </div>
          <div>
              <p className="font-bold text-zinc-100">{user?.name}</p>
            <p className="text-sm text-zinc-400">{user?.email}</p>
            <span className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950 text-red-400 border border-red-900 capitalize">
              {user?.role}
            </span>
          </div>
        </div>
      </Section>

      {/* Change Password */}
      <Section icon={Lock} title="Change Password" desc="Update your login password">
        <form onSubmit={handlePwChange} className="space-y-3 max-w-md">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input" value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required minLength={6} />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="input" value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} required />
          </div>
          <button type="submit" className="btn-primary" disabled={pwLoading}>
            <Save size={15} /> {pwLoading ? 'Saving…' : 'Update Password'}
          </button>
        </form>
      </Section>

      {/* Staff Management */}
      {user?.role === 'admin' && (
        <Section icon={Users} title="Staff Management" desc="Manage staff accounts">
          <div className="space-y-3">
            {staff.length === 0 ? (
              <p className="text-sm text-zinc-500 py-2">No staff accounts found.</p>
            ) : staff.map((s) => (
              <motion.div key={s._id} layout
                className="flex items-center justify-between p-3 rounded-xl bg-zinc-800 border border-zinc-700">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-950 flex items-center justify-center font-bold text-red-500">
                    {s.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{s.name}</p>
                    <p className="text-xs text-zinc-500">{s.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-700 text-zinc-300 capitalize">{s.role}</span>
                  {s._id !== user?._id && (
                    <button
                      onClick={() => handleDeleteStaff(s._id, s.name)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-950 transition">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}

            {!showAdd ? (
              <button onClick={() => setShowAdd(true)} className="btn-secondary gap-2 mt-2">
                <Plus size={15} /> Add Staff Account
              </button>
            ) : (
              <form onSubmit={handleAddStaff} className="space-y-3 p-4 rounded-xl border border-red-900/40 bg-red-950/20 mt-2">
                <h4 className="text-sm font-semibold text-zinc-100">New Staff Account</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Full Name *</label>
                    <input className="input" value={newStaff.name}
                      onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input type="email" className="input" value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">Password *</label>
                    <input type="password" className="input" value={newStaff.password}
                      onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })} required minLength={6} />
                  </div>
                  <div>
                    <label className="label">Role</label>
                    <select className="input" value={newStaff.role}
                      onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary" disabled={adding}>
                    <Plus size={14} /> {adding ? 'Creating…' : 'Create Account'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </Section>
      )}
    </div>
  )
}
