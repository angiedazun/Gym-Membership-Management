import { useEffect, useState } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const EMPTY = { name: '', description: '', durationDays: 30, price: '', features: '', color: '#6366f1', isActive: true }

export default function Plans() {
  const [plans,   setPlans]   = useState([])
  const [open,    setOpen]    = useState(false)
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  const load = () => api.get('/plans').then(({ data }) => setPlans(data.plans))
  useEffect(() => { load() }, [])

  const openModal = (plan = null) => {
    if (plan) {
      setForm({ ...plan, features: plan.features.join(', ') })
      setEditing(plan._id)
    } else {
      setForm(EMPTY)
      setEditing(null)
    }
    setOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = { ...form, features: form.features.split(',').map((f) => f.trim()).filter(Boolean) }
    try {
      if (editing) {
        await api.put(`/plans/${editing}`, payload)
        toast.success('Plan updated!')
      } else {
        await api.post('/plans', payload)
        toast.success('Plan created!')
      }
      setOpen(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  const deletePlan = async (id, name) => {
    if (!confirm(`Delete plan "${name}"?`)) return
    await api.delete(`/plans/${id}`)
    toast.success('Plan deleted')
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => openModal()} className="btn-primary"><Plus size={16} /> New Plan</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <motion.div
            key={plan._id}
            layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="card border-t-4 flex flex-col gap-3"
            style={{ borderTopColor: plan.color }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-zinc-100 text-lg">{plan.name}</h3>
                <p className="text-xs text-zinc-500">{plan.durationDays} days</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openModal(plan)} className="p-1 text-zinc-400 hover:text-red-400 transition">
                  <Pencil size={14} />
                </button>
                <button onClick={() => deletePlan(plan._id, plan.name)} className="p-1 text-zinc-400 hover:text-red-500 transition">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">LKR {plan.price.toLocaleString()}</p>
            <ul className="space-y-1.5 mt-1">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                  <CheckCircle size={12} style={{ color: plan.color }} /> {f}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="card w-full max-w-md"
            >
              <h2 className="text-lg font-bold text-zinc-100 mb-4">{editing ? 'Edit Plan' : 'New Plan'}</h2>
              <form onSubmit={handleSave} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Name *</label>
                    <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">Price (LKR) *</label>
                    <input type="number" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">Duration (days) *</label>
                    <input type="number" className="input" value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">Color</label>
                    <input type="color" className="input h-10 cursor-pointer" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="label">Description</label>
                  <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div>
                  <label className="label">Features (comma separated)</label>
                  <textarea className="input resize-none" rows={2} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Gym access, Locker, Sauna…" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
                    {loading ? 'Saving…' : editing ? 'Update' : 'Create'}
                  </button>
                  <button type="button" className="btn-secondary flex-1 justify-center" onClick={() => setOpen(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
