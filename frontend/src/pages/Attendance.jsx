import { useEffect, useState, useRef } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { LogIn, LogOut, RefreshCw, Search, QrCode, X } from 'lucide-react'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Html5Qrcode } from 'html5-qrcode'

export default function Attendance() {
  const [records,    setRecords]    = useState([])
  const [todayCount, setTodayCount] = useState(0)
  const [search,     setSearch]     = useState('')
  const [loading,    setLoading]    = useState(false)
  const [checkId,    setCheckId]    = useState('')
  const [checking,   setChecking]   = useState(false)
  const [qrOpen,     setQrOpen]     = useState(false)
  const scannerRef = useRef(null)

  const loadToday = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/attendance/today')
      setRecords(data.records)
      setTodayCount(data.count)
    } catch { toast.error('Failed to load attendance') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadToday() }, [])

  // start/stop QR scanner
  useEffect(() => {
    if (qrOpen) {
      setTimeout(() => {
        const scanner = new Html5Qrcode('qr-reader')
        scannerRef.current = scanner
        scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: 200 },
          async (text) => {
            await scanner.stop()
            setQrOpen(false)
            // text is the member's MongoDB _id
            setChecking(true)
            try {
              const { data } = await api.post('/attendance/checkin', { memberId: text, method: 'qr' })
              toast.success(data.message)
              loadToday()
            } catch (err) {
              toast.error(err.response?.data?.message || 'QR check-in failed')
            } finally { setChecking(false) }
          },
          () => {}
        ).catch((e) => toast.error('Camera error: ' + e))
      }, 200)
    } else if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {})
      scannerRef.current = null
    }
  }, [qrOpen])

  const handleCheckIn = async (e) => {
    e.preventDefault()
    if (!checkId.trim()) return
    setChecking(true)
    try {
      const { data } = await api.post('/attendance/checkin', { memberId: checkId.trim(), method: 'manual' })
      toast.success(data.message)
      setCheckId('')
      loadToday()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed')
    } finally {
      setChecking(false)
    }
  }

  const handleCheckOut = async (id) => {
    try {
      await api.put(`/attendance/checkout/${id}`)
      toast.success('Checked out!')
      loadToday()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-out failed')
    }
  }

  const filtered = records.filter((r) =>
    !search || r.member?.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.member?.memberId?.includes(search)
  )

  return (
    <div className="space-y-4">
      {/* Check-in bar */}
      <div className="card flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div>
          <p className="text-sm font-bold text-zinc-100">Today's Attendance</p>
          <p className="text-xs text-zinc-500">{todayCount} check-in(s) today</p>
        </div>
        <form onSubmit={handleCheckIn} className="flex gap-2 flex-1">
          <input
            className="input flex-1"
            placeholder="Enter Member ID (e.g. M-0001)…"
            value={checkId}
            onChange={(e) => setCheckId(e.target.value)}
          />
          <button type="submit" className="btn-primary shrink-0" disabled={checking}>
            <LogIn size={16} />
            {checking ? 'Checking…' : 'Check In'}
          </button>
          <button type="button" onClick={() => setQrOpen(true)}
            className="btn-secondary shrink-0 gap-2" title="Scan QR Code">
            <QrCode size={16} /> Scan QR
          </button>
        </form>
        <button onClick={loadToday} className="btn-secondary p-2 shrink-0" title="Refresh">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {qrOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="card w-full max-w-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <QrCode size={18} className="text-red-500" />
                  <h3 className="font-bold text-zinc-100">Scan Member QR</h3>
                </div>
                <button onClick={() => setQrOpen(false)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100">
                  <X size={16} />
                </button>
              </div>
              <div id="qr-reader" className="rounded-xl overflow-hidden bg-zinc-800" style={{ width: '100%' }} />
              <p className="text-xs text-zinc-500 text-center mt-3">Point the camera at a member's QR code</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input className="input pl-9" placeholder="Filter by name or ID…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-head">
                {['Member', 'ID', 'Check In', 'Check Out', 'Duration', 'Method', 'Action'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-zinc-500">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-zinc-500">No attendance records for today</td></tr>
              ) : filtered.map((r) => {
                const duration = r.checkOut
                  ? Math.round((new Date(r.checkOut) - new Date(r.checkIn)) / 60000)
                  : null
                return (
                  <tr key={r._id} className="table-row">
                    <td className="table-cell font-semibold text-zinc-100">{r.member?.name}</td>
                    <td className="table-cell font-mono text-xs text-zinc-500">{r.member?.memberId}</td>
                    <td className="table-cell text-zinc-300">{format(new Date(r.checkIn), 'hh:mm a')}</td>
                    <td className="table-cell text-zinc-300">
                      {r.checkOut ? format(new Date(r.checkOut), 'hh:mm a') : (
                        <span className="text-green-600 text-xs font-semibold">Still In</span>
                      )}
                    </td>
                    <td className="table-cell text-zinc-400">
                      {duration ? `${duration} min` : '–'}
                    </td>
                    <td className="table-cell">
                      <span className="px-2 py-0.5 bg-zinc-700 text-zinc-300 rounded text-xs capitalize">{r.method}</span>
                    </td>
                    <td className="table-cell">
                      {!r.checkOut && (
                        <button
                          onClick={() => handleCheckOut(r._id)}
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium transition"
                        >
                          <LogOut size={12} /> Check Out
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
