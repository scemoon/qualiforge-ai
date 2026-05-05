import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { path: '/my', label: '我的主页', icon: '🏠' },
  { path: '/my/article/new', label: '发布文章', icon: '✏️' },
  { path: '/my/collection', label: '我的收藏', icon: '❤️' },
  { path: '/my/notifications', label: '通知中心', icon: '🔔' },
]

export default function MyLayout() {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      <aside className="w-48 bg-white border-r border-[#E5E7EB] flex-shrink-0">
        <div className="p-4 border-b border-[#E5E7EB]">
          <div className="w-10 h-10 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-lg font-bold">
            {user?.nickname?.[0]?.toUpperCase() || 'U'}
          </div>
          <p className="text-sm font-medium text-[#111827] mt-2">{user?.nickname || '专家'}</p>
          <p className="text-xs text-[#9CA3AF]">{user?.email}</p>
        </div>
        <nav className="p-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                location.pathname === item.path
                  ? 'bg-[#EEF2FF] text-[#4F46E5] font-medium'
                  : 'text-[#4B5563] hover:bg-[#F3F4F6]'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4">
          <button onClick={logout} className="text-xs text-[#9CA3AF] hover:text-[#EF4444]">退出</button>
        </div>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  )
}
