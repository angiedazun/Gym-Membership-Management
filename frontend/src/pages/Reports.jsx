import { useEffect, useState } from 'react'
import api from '../api/axios'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { Download, FileText, Sheet } from 'lucide-react'
import { motion } from 'framer-motion'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const COLORS  = ['#e11d48','#f59e0b','#8b5cf6','#10b981','#6366f1']

const Stat = ({ label, value, sub, color = 'red' }) => {
  const textColor = { red:'text-red-400', green:'text-emerald-400',
                      yellow:'text-amber-400', purple:'text-purple-400' }
  return (
    <div className="card flex flex-col gap-1">
      <p className="text-xs text-zinc-500 font-medium">{label}</p>
      <p className={`text-2xl font-bold ${textColor[color] || 'text-red-400'}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-600">{sub}</p>}
    </div>
  )
}

export default function Reports() {
  const [year,    setYear]    = useState(new Date().getFullYear())
  const [summary, setSummary] = useState(null)
  const [dash,    setDash]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/payments/summary', { params: { year } }),
      api.get('/dashboard'),
    ]).then(([rev, d]) => {
      setSummary(rev.data)
      setDash(d.data)
    }).finally(() => setLoading(false))
  }, [year])

  const revenueData = summary?.months.map((m) => ({
    name: MONTHS[m.month - 1], revenue: m.revenue, count: m.count,
  })) || []

  const handleExportPDF = () => {
    const doc = new jsPDF()
    doc.setFillColor(225, 29, 72)
    doc.rect(0, 0, 210, 22, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Combat Fitness', 14, 10)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Revenue Report — ${year}`, 14, 17)
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 150, 17)
    doc.setTextColor(0, 0, 0)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Summary', 14, 32)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Total Revenue: LKR ${totalRevenue.toLocaleString()}`, 14, 39)
    doc.text(`Total Payments: ${totalPayments}`, 80, 39)
    doc.text(`Avg per Payment: LKR ${avgRevenue.toLocaleString()}`, 140, 39)

    autoTable(doc, {
      startY: 46,
      head: [['Month', 'Revenue (LKR)', 'Payments', 'Avg (LKR)']],
      body: revenueData.map((r) => [
        r.name,
        r.revenue.toLocaleString(),
        r.count,
        r.count > 0 ? Math.round(r.revenue / r.count).toLocaleString() : '0',
      ]),
      headStyles: { fillColor: [225, 29, 72], textColor: 255 },
      alternateRowStyles: { fillColor: [249, 249, 249] },
      styles: { fontSize: 10 },
      foot: [['TOTAL', totalRevenue.toLocaleString(), totalPayments, avgRevenue.toLocaleString()]],
      footStyles: { fillColor: [30, 30, 30], textColor: 255, fontStyle: 'bold' },
    })

    doc.save(`revenue-report-${year}.pdf`)
  }

  const handleExportExcel = () => {
    const sheetData = [
      ['Combat Fitness — Revenue Report', year],
      [`Generated: ${new Date().toLocaleDateString('en-GB')}`],
      [],
      ['Month', 'Revenue (LKR)', 'Payments', 'Avg per Payment (LKR)'],
      ...revenueData.map((r) => [r.name, r.revenue, r.count, r.count > 0 ? Math.round(r.revenue / r.count) : 0]),
      [],
      ['TOTAL', totalRevenue, totalPayments, avgRevenue],
    ]
    const ws = XLSX.utils.aoa_to_sheet(sheetData)
    ws['!cols'] = [{ wch: 12 }, { wch: 18 }, { wch: 12 }, { wch: 22 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, `Revenue ${year}`)
    XLSX.writeFile(wb, `revenue-report-${year}.xlsx`)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const totalRevenue = revenueData.reduce((s, m) => s + m.revenue, 0)
  const totalPayments = revenueData.reduce((s, m) => s + m.count, 0)
  const avgRevenue = totalPayments > 0 ? Math.round(totalRevenue / totalPayments) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
        <h2 className="text-xl font-black text-white">Reports & Analytics</h2>
        <p className="text-sm text-zinc-500 mt-0.5">Financial and membership overview</p>
        </div>
        <div className="flex gap-2">
          <select
            className="input w-28"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {[2023, 2024, 2025, 2026].map((y) => <option key={y}>{y}</option>)}
          </select>
          <button onClick={handleExportPDF} className="btn-secondary gap-2">
            <FileText size={15} /> PDF
          </button>
          <button onClick={handleExportExcel} className="btn-secondary gap-2">
            <Download size={15} /> Excel
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total Revenue" value={`LKR ${totalRevenue.toLocaleString()}`} color="green" sub={`${year} year total`} />
        <Stat label="Total Payments" value={totalPayments} color="red" sub="transactions" />
        <Stat label="Avg per Payment" value={`LKR ${avgRevenue.toLocaleString()}`} color="purple" />
        <Stat label="Active Members" value={dash?.stats.activeMembers ?? 0} color="yellow" sub="currently active" />
      </div>

      {/* Revenue Area Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-zinc-100">Monthly Revenue — {year}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Revenue collected per month</p>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revGradR" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e11d48" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false}
                   tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12, color: '#fff' }}
              formatter={(val, name) => [name === 'revenue' ? `LKR ${val.toLocaleString()}` : val, name === 'revenue' ? 'Revenue' : 'Payments']}
            />
            <Area type="monotone" dataKey="revenue" stroke="#e11d48" strokeWidth={2.5}
                  fill="url(#revGradR)" dot={{ fill: '#e11d48', r: 3 }} name="revenue" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Payments Bar + Plan Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
          <h3 className="text-sm font-bold text-zinc-100 mb-1">Monthly Payment Count</h3>
          <p className="text-xs text-zinc-500 mb-4">Number of transactions per month</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12, color: '#fff' }} />
              <Bar dataKey="count" fill="#e11d48" radius={[6,6,0,0]} name="Payments" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
          <h3 className="text-sm font-bold text-zinc-100 mb-1">Members by Plan</h3>
          <p className="text-xs text-zinc-500 mb-4">Current distribution</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="55%" height={180}>
              <PieChart>
                <Pie data={dash?.planDistribution || []} dataKey="count" nameKey="name"
                     cx="50%" cy="50%" outerRadius={70} innerRadius={30}>
                  {(dash?.planDistribution || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5 flex-1">
              {(dash?.planDistribution || []).map((p, i) => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                    <span className="text-xs text-zinc-400">{p.name}</span>
                  </div>
                  <span className="text-xs font-bold text-zinc-100">{p.count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
