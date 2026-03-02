import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import KpiCard from '../components/KpiCard'
import StatusBadge from '../components/StatusBadge'
import {
  Users, UserCheck, AlertTriangle, DollarSign, Dumbbell,
  CalendarClock, Activity, TrendingUp, ArrowRight,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { format } from 'date-fns'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const PIE_COLORS = ['#e11d48','#f59e0b','#8b5cf6','#10b981','#6366f1']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl shadow-lg px-4 py-3">
        <p className="text-xs font-semibold text-zinc-400 mb-1">{label}</p>
        <p className="text-sm font-bold text-red-400">LKR {payload[0].value.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [data, setData]       = useState(null)
  const [revenue, setRevenue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [now, setNow]         = useState(new Date())

  // Tick every second
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    Promise.all([api.get('/dashboard'), api.get('/payments/summary')])
      .then(([dash, rev]) => { setData(dash.data); setRevenue(rev.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-zinc-500">Loading dashboard…</p>
      </div>
    </div>
  )
  if (!data) return null

  const { stats, recentMembers, planDistribution } = data
  const revenueChartData = revenue?.months.map((m) => ({
    name: MONTHS[m.month - 1], revenue: m.revenue,
  })) || []

  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning 🌅'
                 : hour < 17 ? 'Good afternoon ☀️'
                 : hour < 21 ? 'Good evening 🌆'
                 :             'Good night 🌙'

  const dateStr = format(now, 'EEEE, dd MMMM yyyy')
  const timeStr = format(now, 'hh:mm:ss a')

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
        <div>
          <h2 className="text-xl font-black text-white">{greeting}</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Here's what's happening at Combat Fitness today.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-zinc-100">{timeStr}</p>
          <p className="text-xs text-zinc-500">{dateStr}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Members"     value={stats.totalMembers}     icon={Users}         color="indigo" />
        <KpiCard title="Active Members"    value={stats.activeMembers}    icon={UserCheck}     color="green"  />
        <KpiCard title="Today's Check-ins" value={stats.todayAttendance}  icon={Activity}      color="blue"   />
        <KpiCard title="Expiring (7 days)" value={stats.expiringThisWeek} icon={CalendarClock} color="yellow" />
        <KpiCard title="Monthly Revenue"   value={`LKR ${stats.monthlyRevenue.toLocaleString()}`} icon={DollarSign}    color="green"  />
        <KpiCard title="Total Revenue"     value={`LKR ${stats.totalRevenue.toLocaleString()}`}   icon={TrendingUp}    color="purple" />
        <KpiCard title="Expired Members"   value={stats.expiredMembers}   icon={AlertTriangle} color="red"    />
        <KpiCard title="Active Trainers"   value={stats.totalTrainers}    icon={Dumbbell}      color="indigo" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Area Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Revenue Overview</h3>
              <p className="text-xs text-zinc-500 mt-0.5">{revenue?.year} annual performance</p>
            </div>
            <Link to="/reports" className="btn-ghost text-xs text-red-400">
              View Report <ArrowRight size={12} />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueChartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e11d48" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false}
                     tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#e11d48" strokeWidth={2.5}
                    fill="url(#revGrad)" dot={{ fill: '#e11d48', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
          <h3 className="text-sm font-bold text-zinc-100 mb-1">Members by Plan</h3>
          <p className="text-xs text-zinc-500 mb-4">Current distribution</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={planDistribution} dataKey="count" nameKey="name"
                   cx="50%" cy="50%" outerRadius={70} innerRadius={30}
                   strokeWidth={2} stroke="#09090b">
                {planDistribution.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12, color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {planDistribution.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                    <span className="text-xs text-zinc-400">{p.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-zinc-100">{p.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Members */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Recent Members</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Latest registrations</p>
          </div>
          <Link to="/members" className="btn-ghost text-xs text-red-400">
            View All <ArrowRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm">
            <thead className="table-head"><tr>
              {['ID','Name','Plan','Expiry','Status'].map((h) => <th key={h}>{h}</th>)}
            </tr></thead>
            <tbody>
              {recentMembers.map((m) => (
                <tr key={m._id} className="table-row">
                  <td className="table-cell font-mono text-xs text-zinc-500">{m.memberId}</td>
                  <td className="table-cell font-semibold text-zinc-100">{m.name}</td>
                  <td className="table-cell">
                    {m.plan ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: `${m.plan.color}18`, color: m.plan.color }}>
                        {m.plan.name}
                      </span>
                    ) : '–'}
                  </td>
                    <td className="table-cell text-zinc-500">
                    {m.membershipExpiry ? format(new Date(m.membershipExpiry), 'dd MMM yyyy') : '–'}
                  </td>
                  <td className="table-cell"><StatusBadge status={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
