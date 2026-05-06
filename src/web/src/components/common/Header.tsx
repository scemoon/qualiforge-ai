import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] h-16 flex items-center">
      <div className="max-w-6xl mx-auto w-full px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-[#4F46E5]">⚡ QualiForge</span>
          <span className="text-sm text-[#4B5563] hidden sm:inline">AI Coding 质量保障</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {isAuthenticated ? (
            <>
              {user?.role === 'admin' ? (
                <Link to="/admin" className="text-[#F59E0B] font-medium hover:underline">管理后台</Link>
              ) : (
                <Link to="/my" className="text-[#4B5563] hover:text-[#4F46E5] transition">专家中心</Link>
              )}
              <button onClick={logout} className="text-[#9CA3AF] hover:text-[#EF4444] transition">退出</button>
            </>
          ) : (
            <Link to="/login" className="px-4 py-1.5 bg-[#4F46E5] text-white rounded-md hover:bg-[#4338CA] transition text-sm">
              登录
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}