import { useEffect, useState } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Phone, Mail, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const EMPTY = { name: '', phone: '', email: '', specialization: '', experience: 0, salary: '', bio: '' }

export default function Trainers() {
  const [trainers, setTrainers] = useState([])
  const [open,     setOpen]     = useState(false)
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(EMPTY)
  const [loading,  setLoading]  = useState(false)

  const load = () => api.get('/trainers').then(({ data }) => setTrainers(data.trainers))
  useEffect(() => { load() }, [])

  const openModal = (t = null) => {
    if (t) {
      setForm({ ...t, specialization: t.specialization.join(', ') })
      setEditing(t._id)
    } else {
      setForm(EMPTY)
      setEditing(null)
    }
    setOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = { ...form, specialization: form.specialization.split(',').map((s) => s.trim()).filter(Boolean) }
    try {
      if (editing) {
        await api.put(`/trainers/${editing}`, payload)
        toast.success('Trainer updated!')
      } else {
        await api.post('/trainers', payload)
        toast.success('Trainer added!')
      }
      setOpen(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  const deleteTrainer = async (id, name) => {
    if (!confirm(`Delete trainer "${name}"?`)) return
    await api.delete(`/trainers/${id}`)
    toast.success('Trainer deleted')
    load()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => openModal()} className="btn-primary"><Plus size={16} /> Add Trainer</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trainers.map((t) => (
          <motion.div
            key={t._id} layout
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="card flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center text-lg font-bold text-white">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-zinc-100">{t.name}</p>
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <Star size={10} className="text-yellow-400" /> {t.experience} yrs exp
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openModal(t)} className="p-1 text-zinc-400 hover:text-red-400 transition"><Pencil size={14} /></button>
                <button onClick={() => deleteTrainer(t._id, t.name)} className="p-1 text-zinc-400 hover:text-red-500 transition"><Trash2 size={14} /></button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {t.specialization.map((s, i) => (
                <span key={i} className="px-2 py-0.5 bg-red-950 text-red-400 text-xs rounded-full font-medium border border-red-900">{s}</span>
              ))}
            </div>

            <div className="space-y-1 text-xs text-zinc-500">
              {t.phone && <p className="flex items-center gap-2"><Phone size={12} />{t.phone}</p>}
              {t.email && <p className="flex items-center gap-2"><Mail size={12} />{t.email}</p>}
            </div>

            {t.salary > 0 && (
              <p className="text-xs text-zinc-500">Salary: <span className="text-zinc-200 font-semibold">LKR {t.salary.toLocaleString()}</span></p>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="card w-full max-w-md"
            >
              <h2 className="text-lg font-bold text-zinc-100 mb-4">{editing ? 'Edit Trainer' : 'Add Trainer'}</h2>
              <form onSubmit={handleSave} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Name *</label>
                    <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">Phone *</label>
                    <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Experience (yrs)</label>
                    <input type="number" className="input" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Salary (LKR)</label>
                    <input type="number" className="input" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="label">Specialization (comma separated)</label>
                  <input className="input" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="Weight Training, Yoga…" />
                </div>
                <div>
                  <label className="label">Bio</label>
                  <textarea className="input resize-none" rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
                    {loading ? 'Saving…' : editing ? 'Update' : 'Add'}
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
