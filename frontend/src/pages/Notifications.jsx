import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import StatusBadge from '../components/StatusBadge'
import { Bell, AlertTriangle, CheckCircle, Clock, Pencil } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { motion } from 'framer-motion'

const TABS = [
  { key: 7,   label: 'Expiring in 7d',  color: 'text-red-600',    bg: 'bg-red-50' },
  { key: 14,  label: 'Expiring in 14d', color: 'text-orange-600', bg: 'bg-orange-50' },
  { key: 30,  label: 'Expiring in 30d', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { key: 0,   label: 'Expired',         color: 'text-zinc-300',    bg: 'bg-zinc-700' },
]

export default function Notifications() {
  const [days,    setDays]    = useState(7)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const params = days === 0 ? { status: 'expired', limit: 50 } : { status: 'active', limit: 100 }
      const { data } = await api.get('/members', { params })
      if (days === 0) {
        setMembers(data.members)
      } else {
        const now = new Date()
        setMembers(
          data.members.filter((m) => {
            if (!m.membershipExpiry) return false
            const d = differenceInDays(new Date(m.membershipExpiry), now)
            return d >= 0 && d <= days
          })
        )
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [days])

  const activeTab = TABS.find((t) => t.key === days)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-red-950 rounded-xl flex items-center justify-center">
          <Bell size={20} className="text-red-500" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">Notifications</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Track memberships that need attention</p>
        </div>
      </div>

      {/* Tab Filters */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setDays(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              days === t.key ? `${t.bg} ${t.color}` : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-500">
            <CheckCircle size={40} className="text-green-400 opacity-60" />
            <p className="text-sm font-medium">All clear! No members in this category.</p>
          </div>
        ) : (
          <>
            <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2">
              {days === 0
                ? <AlertTriangle size={15} className="text-zinc-500" />
                : <Clock size={15} className={activeTab?.color} />}
              <span className="text-sm font-semibold text-zinc-200">
                {members.length} member{members.length > 1 ? 's' : ''} — {activeTab?.label}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="table-head"><tr>
                  {['ID','Name','Phone','Plan','Expiry','Days Left','Status','Action'].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {members.map((m) => {
                    const daysLeft = m.membershipExpiry
                      ? differenceInDays(new Date(m.membershipExpiry), new Date())
                      : null
                    return (
                      <tr key={m._id} className="table-row">
                        <td className="table-cell font-mono text-xs text-zinc-500">{m.memberId}</td>
                        <td className="table-cell font-semibold text-zinc-100">{m.name}</td>
                        <td className="table-cell text-zinc-400">{m.phone}</td>
                        <td className="table-cell">
                          {m.plan ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                              style={{ background: `${m.plan.color}18`, color: m.plan.color }}>
                              {m.plan.name}
                            </span>
                          ) : '–'}
                        </td>
                        <td className="table-cell text-zinc-400 text-xs">
                          {m.membershipExpiry ? format(new Date(m.membershipExpiry), 'dd MMM yyyy') : '–'}
                        </td>
                        <td className="table-cell">
                          {daysLeft !== null ? (
                            <span className={`font-bold text-xs ${
                              daysLeft < 0  ? 'text-zinc-500' :
                              daysLeft <= 7 ? 'text-red-600' :
                              daysLeft <= 14 ? 'text-orange-500' : 'text-yellow-600'
                            }`}>
                              {daysLeft < 0 ? `${Math.abs(daysLeft)}d ago` : `${daysLeft}d`}
                            </span>
                          ) : '–'}
                        </td>
                        <td className="table-cell"><StatusBadge status={m.status} /></td>
                        <td className="table-cell">
                          <Link to={`/members/${m._id}/edit`}
                            className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-medium transition">
                            <Pencil size={12} /> Renew
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
