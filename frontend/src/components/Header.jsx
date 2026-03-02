import { useLocation, Link } from 'react-router-dom'
import { Bell, ChevronRight, Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const titles = {
  '/':              'Dashboard',
  '/members':       'Members',
  '/members/new':   'Add Member',
  '/plans':         'Membership Plans',
  '/trainers':      'Trainers',
  '/attendance':    'Attendance',
  '/payments':      'Payments',
  '/reports':       'Reports',
  '/notifications': 'Notifications',
  '/settings':      'Settings',
}

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation()
  const { user }     = useAuth()

  const title = titles[pathname] ||
    (pathname.includes('/profile')       ? 'Member Profile' :
     pathname.includes('/members/')      ? 'Edit Member'    : 'Combat Fitness')

  return (
    <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 sm:px-6 shrink-0">
      {/* Left: hamburger (mobile) + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-red-500 font-bold tracking-tight hidden sm:inline">Combat Fitness</span>
          <ChevronRight size={14} className="text-zinc-600 hidden sm:inline" />
          <span className="font-semibold text-zinc-100">{title}</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <Link
          to="/notifications"
          className="relative p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </Link>
        <div className="h-8 w-px bg-zinc-800 mx-1" />
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-rose-800
                          flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="text-sm hidden sm:block">
            <p className="font-semibold text-zinc-100 leading-none">{user?.name}</p>
            <p className="text-xs text-zinc-500 capitalize mt-0.5">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
