import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

const colorMap = {
  indigo: { bg: 'bg-red-950/40', icon: 'bg-red-600 shadow-red-900', text: 'text-red-400', shadow: 'shadow-red-900' },
  green:  { bg: 'bg-emerald-950/40', icon: 'bg-emerald-600 shadow-emerald-900', text: 'text-emerald-400', shadow: 'shadow-emerald-900' },
  yellow: { bg: 'bg-amber-950/40', icon: 'bg-amber-600 shadow-amber-900', text: 'text-amber-400', shadow: 'shadow-amber-900' },
  red:    { bg: 'bg-red-950/40', icon: 'bg-red-700 shadow-red-900', text: 'text-red-400', shadow: 'shadow-red-900' },
  purple: { bg: 'bg-purple-950/40', icon: 'bg-purple-700 shadow-purple-900', text: 'text-purple-400', shadow: 'shadow-purple-900' },
  blue:   { bg: 'bg-blue-950/40', icon: 'bg-blue-600 shadow-blue-900', text: 'text-blue-400', shadow: 'shadow-blue-900' },
}

export default function KpiCard({ title, value, icon: Icon, color = 'indigo', change, sub }) {
  const c = colorMap[color] || colorMap.indigo

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-card hover:shadow-card-hover hover:border-zinc-700 transition-all hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-white mt-1.5 leading-none">{value ?? '–'}</p>
          {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
          {change !== undefined && (
            <div className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold px-2 py-0.5 rounded-full
              ${change >= 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
              {change >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {Math.abs(change)}% vs last month
            </div>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl ${c.icon} shadow-md flex items-center justify-center shrink-0`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </motion.div>
  )
}
