import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore.ts'

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const roleLabel = (user?.role ?? '') === 'admin' ? '管理员' : '专家'

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] h-16 shrink-0">
      <div className="max-w-6xl mx-auto w-full h-full px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-indigo-500/30">
            ⚡
          </div>
          <div className="hidden sm:block">
            <div className="text-lg font-bold text-[#111827] leading-tight">QualiForge</div>
            <div className="text-xs text-[#9CA3AF] leading-tight hidden md:block">AI Coding 每行代码变得可信</div>
          </div>
        </Link>

        <nav className="flex items-center gap-1 md:gap-2">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center">
                {roleLabel === '管理员' ? (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>管理后台</span>
                  </Link>
                ) : (
                  <Link
                    to="/my"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[#4B5563] hover:text-[#4F46E5] hover:bg-[#F3F4F6] rounded-lg transition text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>专家中心</span>
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-2 pl-2 md:pl-3 border-l border-[#E5E7EB]">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {user?.nickname?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm text-[#4B5563] hidden lg:inline max-w-[100px] truncate">{user?.nickname}</span>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-1 px-2 py-1.5 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-red-50 rounded-lg transition text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">退出</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-xl font-medium text-sm hover:bg-[#4338CA] transition shadow-lg shadow-indigo-500/30"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>登录</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}