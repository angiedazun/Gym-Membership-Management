import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, CreditCard, Dumbbell,
  ClipboardList, DollarSign, LogOut, BarChart3, Bell, Settings, X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { AnimatePresence, motion } from 'framer-motion'

const navGroups = [
  {
    label: 'Main',
    links: [
      { to: '/',           label: 'Dashboard',    icon: LayoutDashboard, end: true },
      { to: '/members',    label: 'Members',       icon: Users },
      { to: '/attendance', label: 'Attendance',    icon: ClipboardList },
      { to: '/payments',   label: 'Payments',      icon: DollarSign },
    ],
  },
  {
    label: 'Manage',
    links: [
      { to: '/plans',         label: 'Plans',         icon: CreditCard },
      { to: '/trainers',      label: 'Trainers',      icon: Dumbbell },
      { to: '/reports',       label: 'Reports',       icon: BarChart3 },
      { to: '/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    label: 'System',
    links: [
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export default function Sidebar({ isOpen, onClose }) {
  const { logout, user } = useAuth()

  const sidebarContent = (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-zinc-800 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-900">
          <Dumbbell size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <span className="text-sm font-bold text-white tracking-tight leading-tight">Combat Fitness</span>
        </div>
        {/* Mobile close button */}
        <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800">
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navGroups.map(({ label, links }) => (
          <div key={label}>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-3 mb-1.5">{label}</p>
            <div className="space-y-0.5">
              {links.map(({ to, label: lbl, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                     ${isActive
                       ? 'bg-red-600/20 text-red-400 border border-red-800/50'
                       : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all
                        ${isActive ? 'bg-red-600 text-white shadow-sm shadow-red-900' : 'text-zinc-500'}`}>
                        <Icon size={15} />
                      </span>
                      {lbl}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-950/60 shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-zinc-800 border border-zinc-700 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-rose-800
                          flex items-center justify-center text-sm font-bold text-white shadow-sm">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-100 truncate">{user?.name}</p>
            <p className="text-xs text-zinc-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-zinc-500
                     hover:bg-red-950 hover:text-red-400 transition-colors font-medium"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop — always visible */}
      <div className="hidden lg:flex shrink-0 h-screen">
        {sidebarContent}
      </div>

      {/* Mobile — slide-in drawer with backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 flex"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
