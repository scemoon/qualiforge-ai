import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { path: '/admin', label: '控制台', icon: '📊', exact: true },
  { path: '/admin/articles', label: '文章管理', icon: '📝' },
  { path: '/admin/articles/review', label: '审核文章', icon: '✅' },
  { path: '/admin/evaluations', label: '评测管理', icon: '🎯' },
  { path: '/admin/skills', label: 'Skill 管理', icon: '🛠️' },
  { path: '/admin/sections', label: '板块管理', icon: '📋' },
  { path: '/admin/tags', label: '标签管理', icon: '🏷️' },
  { path: '/admin/users', label: '用户管理', icon: '👥' },
]

export default function AdminLayout() {
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-[#E5E7EB] flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-[#E5E7EB]">
          <h2 className="font-bold text-[#111827]">⚡ QualiForge Admin</h2>
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
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm mb-0.5 ${
                isActive(item)
                  ? 'bg-[#EEF2FF] text-[#4F46E5] font-medium'
                  : 'text-[#4B5563] hover:bg-[#F3F4F6]'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-[#E5E7EB] flex items-center justify-between">
          <Link to="/" className="text-xs text-[#4F46E5] hover:underline">前台</Link>
          <button onClick={logout} className="text-xs text-[#9CA3AF] hover:text-[#EF4444]">退出</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
