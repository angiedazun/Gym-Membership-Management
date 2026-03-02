import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import StatusBadge from '../components/StatusBadge'
import { Plus, Search, Pencil, Trash2, UserX, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { motion } from 'framer-motion'

const API_URL = 'http://localhost:5000'

export default function Members() {
  const [members,  setMembers]  = useState([])
  const [total,    setTotal]    = useState(0)
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState('')
  const [page,     setPage]     = useState(1)
  const [loading,  setLoading]  = useState(false)
  const LIMIT = 10

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/members', {
        params: { search, status, page, limit: LIMIT },
      })
      setMembers(data.members)
      setTotal(data.total)
    } catch { toast.error('Failed to load members') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [search, status, page])

  const deleteMember = async (id, name) => {
    if (!confirm(`Delete member "${name}"?`)) return
    try {
      await api.delete(`/members/${id}`)
      toast.success('Member deleted')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed')
    }
  }

  const pages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              className="input pl-9"
              placeholder="Search by name, phone, ID…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select
            className="input w-36"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <Link to="/members/new" className="btn-primary shrink-0">
          <Plus size={16} /> Add Member
        </Link>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="card overflow-hidden p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-head">
                {['ID','','Name','Phone','Plan','Trainer','Expiry','Status','Actions'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-10 text-zinc-500">Loading…</td></tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-zinc-500">
                    <UserX size={32} className="mx-auto mb-2 opacity-30" />
                    No members found
                  </td>
                </tr>
              ) : members.map((m) => (
                <tr key={m._id} className="table-row">
                  <td className="table-cell font-mono text-xs text-zinc-500">{m.memberId}</td>
                  <td className="table-cell">
                    {m.profilePhoto ? (
                      <img src={`${API_URL}${m.profilePhoto}`} alt={m.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-zinc-700" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-700 flex items-center justify-center text-sm font-bold text-white">
                        {m.name[0]}
                      </div>
                    )}
                  </td>
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
                  <td className="table-cell text-zinc-400">{m.trainer?.name || '–'}</td>
                  <td className="table-cell text-zinc-400 text-xs">
                    {m.membershipExpiry ? format(new Date(m.membershipExpiry), 'dd MMM yyyy') : '–'}
                  </td>
                  <td className="table-cell"><StatusBadge status={m.status} /></td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <Link to={`/members/${m._id}/profile`}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-emerald-950 transition">
                        <Eye size={14} />
                      </Link>
                      <Link to={`/members/${m._id}/edit`}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950 transition">
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => deleteMember(m._id, m.name)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-950 transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
            <p className="text-xs text-zinc-500">
              Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition
                    ${page === i + 1
                      ? 'bg-red-600 text-white'
                      : 'text-zinc-400 hover:bg-zinc-800'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
