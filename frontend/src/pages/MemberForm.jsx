import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Save, Camera } from 'lucide-react'

const API_URL = 'http://localhost:5000'

const INITIAL = {
  name: '', phone: '', email: '', address: '', dateOfBirth: '',
  gender: 'male', plan: '', trainer: '', notes: '',
  emergencyContact: { name: '', phone: '', relation: '' },
}

export default function MemberForm() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const isEdit      = !!id

  const [form,      setForm]      = useState(INITIAL)
  const [plans,     setPlans]     = useState([])
  const [trainers,  setTrainers]  = useState([])
  const [loading,   setLoading]   = useState(false)
  const [photo,     setPhoto]     = useState('')
  const [uploading, setUploading] = useState(false)
  const photoRef = useRef()

  useEffect(() => {
    Promise.all([api.get('/plans'), api.get('/trainers')]).then(([p, t]) => {
      setPlans(p.data.plans)
      setTrainers(t.data.trainers)
    })
    if (isEdit) {
      api.get(`/members/${id}`).then(({ data }) => {
        const m = data.member
        setPhoto(m.profilePhoto || '')
        setForm({
          name:     m.name || '',
          phone:    m.phone || '',
          email:    m.email || '',
          address:  m.address || '',
          dateOfBirth: m.dateOfBirth ? m.dateOfBirth.slice(0, 10) : '',
          gender:   m.gender || 'male',
          plan:     m.plan?._id || m.plan || '',
          trainer:  m.trainer?._id || m.trainer || '',
          notes:    m.notes || '',
          emergencyContact: m.emergencyContact || { name: '', phone: '', relation: '' },
        })
      })
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('ec_')) {
      setForm((f) => ({ ...f, emergencyContact: { ...f.emergencyContact, [name.slice(3)]: value } }))
    } else {
      setForm((f) => ({ ...f, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        await api.put(`/members/${id}`, form)
        toast.success('Member updated!')
      } else {
        await api.post('/members', form)
        toast.success('Member added!')
      }
      navigate('/members')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving member')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('photo', file)
    setUploading(true)
    try {
      const { data } = await api.post(`/members/${id}/photo`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setPhoto(data.profilePhoto)
      toast.success('Photo updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Photo upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/members')} className="btn-secondary p-2">
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-lg font-semibold text-zinc-100">
          {isEdit ? 'Edit Member' : 'Add New Member'}
        </h2>
      </div>

      {/* Photo upload — edit mode only */}
      {isEdit && (
        <div className="card flex items-center gap-5">
          <div className="relative">
            {photo ? (
              <img src={`${API_URL}${photo}`} alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-red-600" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-red-700 flex items-center justify-center text-2xl font-bold text-white border-2 border-zinc-700">
                {form.name[0] || '?'}
              </div>
            )}
            <button type="button"
              onClick={() => photoRef.current.click()}
              className="absolute bottom-0 right-0 w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition">
              <Camera size={13} />
            </button>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-100">Profile Photo</p>
            <p className="text-xs text-zinc-500 mt-0.5">JPG, PNG, WEBP • Max 3 MB</p>
            {uploading && <p className="text-xs text-red-400 mt-1">Uploading…</p>}
          </div>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        {/* Basic Info */}
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Basic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name *</label>
            <input name="name" className="input" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Phone *</label>
            <input name="phone" className="input" value={form.phone} onChange={handleChange} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input name="email" type="email" className="input" value={form.email} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Date of Birth</label>
            <input name="dateOfBirth" type="date" className="input" value={form.dateOfBirth} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Gender</label>
            <select name="gender" className="input" value={form.gender} onChange={handleChange}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="label">Address</label>
            <input name="address" className="input" value={form.address} onChange={handleChange} />
          </div>
        </div>

        {/* Membership */}
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider pt-2">Membership</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Plan *</label>
            <select name="plan" className="input" value={form.plan} onChange={handleChange} required={!isEdit}>
              <option value="">Select plan…</option>
              {plans.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} – LKR {p.price.toLocaleString()} ({p.durationDays}d)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Trainer (optional)</label>
            <select name="trainer" className="input" value={form.trainer} onChange={handleChange}>
              <option value="">No trainer</option>
              {trainers.map((t) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Emergency */}
        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider pt-2">Emergency Contact</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Name</label>
            <input name="ec_name" className="input" value={form.emergencyContact.name} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input name="ec_phone" className="input" value={form.emergencyContact.phone} onChange={handleChange} />
          </div>
          <div>
            <label className="label">Relation</label>
            <input name="ec_relation" className="input" value={form.emergencyContact.relation} onChange={handleChange} />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes</label>
          <textarea name="notes" rows={2} className="input resize-none" value={form.notes} onChange={handleChange} />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          <Save size={16} />
          {loading ? 'Saving…' : isEdit ? 'Update Member' : 'Add Member'}
        </button>
      </form>
    </div>
  )
}
