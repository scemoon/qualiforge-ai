import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { path: '/forge/my', label: '我的主页', icon: '🏠' },
  { path: '/forge/my/articles', label: '我的文章', icon: '📝' },
  { path: '/forge/my/article/new', label: '发布文章', icon: '✏️' },
  { path: '/forge/my/collection', label: '我的收藏', icon: '❤️' },
  { path: '/forge/my/notifications', label: '通知中心', icon: '🔔' },
]

export default function MyLayout() {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col md:flex-row">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative inset-y-0 left-0 z-50
        w-48 bg-white border-r border-[#E5E7EB] flex flex-col
        transform transition-transform duration-200 ease-in-out
        md:transform-none md:flex
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-lg font-bold">
              {user?.nickname?.[0]?.toUpperCase() || 'U'}
            </div>
            <button
              className="md:hidden text-[#9CA3AF] hover:text-[#111827] text-xl leading-none"
              onClick={() => setSidebarOpen(false)}
            >
              ×
            </button>
          </div>
          <p className="text-sm font-medium text-[#111827] mt-2 truncate">{user?.nickname || '专家'}</p>
          <p className="text-xs text-[#9CA3AF] truncate">{user?.email}</p>
        </div>
        <nav className="flex-1 p-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                location.pathname === item.path
                  ? 'bg-[#EEF2FF] text-[#4F46E5] font-medium'
                  : 'text-[#4B5563] hover:bg-[#F3F4F6]'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-[#E5E7EB] flex items-center justify-between">
          <Link to="/forge/" className="text-xs text-[#4F46E5] hover:underline">← 返回主页</Link>
          <button onClick={logout} className="text-xs text-[#9CA3AF] hover:text-[#EF4444]">退出</button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden bg-white border-b border-[#E5E7EB] p-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#4B5563] hover:text-[#111827] text-xl leading-none"
          >
            ☰
          </button>
          <Link to="/forge/" className="text-sm text-[#4F46E5] hover:underline font-medium">← 返回主页</Link>
          <div className="w-8" />
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}