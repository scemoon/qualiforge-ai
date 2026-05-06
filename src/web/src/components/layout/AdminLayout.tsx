import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { path: '/admin', label: '首页', icon: '🏠', exact: true },
  { path: '/admin/articles', label: '文章管理', icon: '📝' },
  { path: '/admin/articles/review', label: '审核文章', icon: '✅' },
  { path: '/admin/evaluations', label: '评测管理', icon: '🎯' },
  { path: '/admin/sections', label: '板块管理', icon: '📋' },
  { path: '/admin/tags', label: '标签管理', icon: '🏷️' },
  { path: '/admin/users', label: '用户管理', icon: '👥' },
  { path: '/admin/wx-config', label: '公众号配置', icon: '📌' },
]

export default function AdminLayout() {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)

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
        w-56 bg-white border-r border-[#E5E7EB] flex flex-col
        transform transition-transform duration-200 ease-in-out
        md:transform-none md:flex
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#111827]">⚡ QualiForge</h2>
            <button
              className="md:hidden text-[#9CA3AF] hover:text-[#111827] text-xl leading-none"
              onClick={() => setSidebarOpen(false)}
            >
              ×
            </button>
          </div>
          <p className="text-xs text-[#9CA3AF] mt-1 truncate">{user?.email}</p>
          <span className="inline-block mt-1 px-1.5 py-0.5 bg-[#EF4444] text-white text-xs rounded">
            {user?.role === 'admin' ? '管理员' : user?.role}
          </span>
        </div>
        <nav className="flex-1 p-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm mb-0.5 ${
                isActive(item)
                  ? 'bg-[#EEF2FF] text-[#4F46E5] font-medium'
                  : 'text-[#4B5563] hover:bg-[#F3F4F6]'
              }`}
            >
              <span>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-[#E5E7EB] flex items-center justify-between">
          <Link to="/" className="text-xs text-[#4F46E5] hover:underline">← 返回主页</Link>
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
          <Link to="/" className="text-sm text-[#4F46E5] hover:underline font-medium">← 返回主页</Link>
          <div className="w-8" />
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}