import { useEffect, useState } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import StatusBadge from '../components/StatusBadge'
import { Plus, Search, DollarSign, Download, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

const EMPTY_PAY = { memberId: '', planId: '', amount: '', discount: 0, method: 'cash', notes: '' }

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [total,    setTotal]    = useState(0)
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(1)
  const [open,     setOpen]     = useState(false)
  const [form,     setForm]     = useState(EMPTY_PAY)
  const [plans,    setPlans]    = useState([])
  const [members,  setMembers]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const LIMIT = 10

  const load = async () => {
    try {
      const { data } = await api.get('/payments', { params: { page, limit: LIMIT } })
      setPayments(data.payments)
      setTotal(data.total)
    } catch { toast.error('Failed to load payments') }
  }

  useEffect(() => { load() }, [page])
  useEffect(() => {
    api.get('/plans').then(({ data }) => setPlans(data.plans))
    api.get('/members', { params: { status: 'active', limit: 100 } }).then(({ data }) => setMembers(data.members))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/payments', form)
      toast.success('Payment recorded!')
      setOpen(false)
      setForm(EMPTY_PAY)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  // Update amount when plan selected
  const planChange = (planId) => {
    const plan = plans.find((p) => p._id === planId)
    setForm((f) => ({ ...f, planId, amount: plan ? plan.price : '' }))
  }

  const downloadInvoice = (p) => {
    const doc = new jsPDF()
    // Header
    doc.setFillColor(225, 29, 72)
    doc.rect(0, 0, 210, 28, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18); doc.setFont('helvetica', 'bold')
    doc.text('COMBAT FITNESS', 14, 12)
    doc.setFontSize(10); doc.setFont('helvetica', 'normal')
    doc.text('Payment Receipt', 14, 21)
    doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 150, 21)

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14); doc.setFont('helvetica', 'bold')
    doc.text('RECEIPT', 14, 40)
    doc.setFontSize(11); doc.setFont('helvetica', 'normal')
    doc.text(`Payment ID: ${p.paymentId}`, 14, 48)
    doc.text(`Member: ${p.member?.name}`, 14, 55)
    doc.text(`Member ID: ${p.member?.memberId}`, 14, 62)

    autoTable(doc, {
      startY: 72,
      head: [['Description', 'Details']],
      body: [
        ['Plan', p.plan?.name || '—'],
        ['Amount', `LKR ${p.amount?.toLocaleString()}`],
        ['Discount', `LKR ${p.discount?.toLocaleString() || '0'}`],
        ['Final Amount', `LKR ${p.finalAmount?.toLocaleString()}`],
        ['Payment Method', p.method?.toUpperCase() || '—'],
        ['Payment Date', p.paymentDate ? format(new Date(p.paymentDate), 'dd MMM yyyy') : '—'],
        ['Valid From', p.validFrom ? format(new Date(p.validFrom), 'dd MMM yyyy') : '—'],
        ['Valid Until', p.validTo ? format(new Date(p.validTo), 'dd MMM yyyy') : '—'],
        ['Status', p.status?.toUpperCase() || '—'],
      ],
      headStyles: { fillColor: [225, 29, 72], textColor: 255 },
      alternateRowStyles: { fillColor: [249, 249, 249] },
      styles: { fontSize: 11 },
    })

    const finalY = doc.lastAutoTable.finalY + 10
    doc.setFontSize(10); doc.setTextColor(120, 120, 120)
    doc.text('Thank you for choosing Combat Fitness!', 14, finalY)
    doc.text('Train Hard. Manage Smarter.', 14, finalY + 6)

    doc.save(`receipt-${p.paymentId}.pdf`)
  }

  const exportExcel = () => {
    const rows = [
      ['Combat Fitness — Payment History'],
      [`Exported: ${new Date().toLocaleDateString('en-GB')}`],
      [],
      ['Pay ID', 'Member', 'Plan', 'Amount (LKR)', 'Discount', 'Final (LKR)', 'Method', 'Date', 'Valid To', 'Status'],
      ...payments.map((p) => [
        p.paymentId,
        p.member?.name,
        p.plan?.name,
        p.amount,
        p.discount || 0,
        p.finalAmount,
        p.method,
        p.paymentDate ? format(new Date(p.paymentDate), 'dd MMM yyyy') : '',
        p.validTo ? format(new Date(p.validTo), 'dd MMM yyyy') : '',
        p.status,
      ]),
    ]
    const ws = XLSX.utils.aoa_to_sheet(rows)
    ws['!cols'] = [12,20,16,14,10,14,12,14,14,10].map((w) => ({ wch: w }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Payments')
    XLSX.writeFile(wb, `payments-${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
  }

  const filtered = payments.filter((p) =>
    !search || p.member?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.paymentId?.includes(search.toUpperCase())
  )

  const pages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input pl-9" placeholder="Search by member or payment ID…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary shrink-0">
          <Plus size={16} /> Record Payment
        </button>
        <button onClick={exportExcel} className="btn-secondary shrink-0">
          <Download size={15} /> Excel
        </button>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-head">
                {['Pay ID', 'Member', 'Plan', 'Amount', 'Method', 'Date', 'Valid To', 'Status', ''].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-zinc-500">No payments found</td></tr>
              ) : filtered.map((p) => (
                <tr key={p._id} className="table-row">
                  <td className="table-cell font-mono text-xs text-zinc-500">{p.paymentId}</td>
                  <td className="table-cell font-semibold text-zinc-100">{p.member?.name}</td>
                  <td className="table-cell text-zinc-400">{p.plan?.name}</td>
                  <td className="table-cell text-green-600 font-semibold">
                    LKR {p.finalAmount?.toLocaleString()}
                    {p.discount > 0 && <span className="ml-1 text-xs text-zinc-500">(-{p.discount})</span>}
                  </td>
                  <td className="table-cell">
                    <span className="px-2.5 py-0.5 bg-zinc-700 text-zinc-300 rounded-full text-xs capitalize font-medium">{p.method}</span>
                  </td>
                  <td className="table-cell text-zinc-400 text-xs">
                    {p.paymentDate ? format(new Date(p.paymentDate), 'dd MMM yyyy') : '–'}
                  </td>
                  <td className="table-cell text-zinc-400 text-xs">
                    {p.validTo ? format(new Date(p.validTo), 'dd MMM yyyy') : '–'}
                  </td>
                  <td className="table-cell"><StatusBadge status={p.status} /></td>
                  <td className="table-cell">
                    <button onClick={() => downloadInvoice(p)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950 transition"
                      title="Download Receipt">
                      <FileText size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
            <p className="text-xs text-zinc-500">Page {page} of {pages}</p>
            <div className="flex gap-1">
              {Array.from({ length: pages }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition
                    ${page === i + 1 ? 'bg-red-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Create Payment Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card w-full max-w-md"
            >
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={18} className="text-green-500" />
                <h2 className="text-lg font-bold text-zinc-100">Record Payment</h2>
              </div>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="label">Member *</label>
                  <select className="input" value={form.memberId}
                    onChange={(e) => setForm({ ...form, memberId: e.target.value })} required>
                    <option value="">Select member…</option>
                    {members.map((m) => (
                      <option key={m._id} value={m._id}>{m.name} ({m.memberId})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Plan *</label>
                  <select className="input" value={form.planId}
                    onChange={(e) => planChange(e.target.value)} required>
                    <option value="">Select plan…</option>
                    {plans.map((p) => (
                      <option key={p._id} value={p._id}>{p.name} – LKR {p.price.toLocaleString()}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Amount (LKR) *</label>
                    <input type="number" className="input" value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
                  </div>
                  <div>
                    <label className="label">Discount</label>
                    <input type="number" className="input" value={form.discount}
                      onChange={(e) => setForm({ ...form, discount: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="label">Payment Method</label>
                  <select className="input" value={form.method}
                    onChange={(e) => setForm({ ...form, method: e.target.value })}>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                <div>
                  <label className="label">Notes</label>
                  <input className="input" value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
                {form.amount > 0 && (
                  <p className="text-sm text-green-600 font-semibold">
                    Final: LKR {(Number(form.amount) - Number(form.discount || 0)).toLocaleString()}
                  </p>
                )}
                <div className="flex gap-2 pt-1">
                  <button type="submit" className="btn-primary flex-1 justify-center" disabled={loading}>
                    {loading ? 'Saving…' : 'Record Payment'}
                  </button>
                  <button type="button" className="btn-secondary flex-1 justify-center"
                    onClick={() => { setOpen(false); setForm(EMPTY_PAY) }}>
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
