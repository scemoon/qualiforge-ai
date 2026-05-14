import { useAuthStore } from '../../store/authStore'
import { Link } from 'react-router-dom'
import ResponsiveContainer from '../../components/common/ResponsiveContainer'

const menuItems = [
  { path: '/my/articles/new', label: '发布文章', desc: '创建新的专业内容', icon: '✏️', color: 'from-violet-500 to-purple-600' },
  { path: '/my/articles', label: '我的文章', desc: '管理已发布和草稿', icon: '📝', color: 'from-blue-500 to-cyan-600' },
  { path: '/my/collection', label: '我的收藏', desc: '收藏的文章列表', icon: '❤️', color: 'from-rose-500 to-pink-600' },
  { path: '/my/notifications', label: '通知中心', desc: '查看系统通知', icon: '🔔', color: 'from-amber-500 to-orange-600' },
]

export default function MyDashboard() {
  const { user } = useAuthStore()
  const roleLabel = (user?.role ?? '') === 'admin' ? '管理员' : '专家'

  return (
    <ResponsiveContainer className="py-8 md:py-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#111827]">欢迎回来</h1>
        <p className="text-[#6B7280] mt-1">管理您的内容和查看最新动态</p>
      </div>

      <div className="bg-white rounded-xl md:rounded-2xl border border-[#E5E7EB] p-4 md:p-6 md:p-8 mb-4 md:mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-xl md:text-2xl font-bold shadow-lg shadow-indigo-500/20">
            {user?.nickname?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-xl font-bold text-[#111827] truncate">{user?.nickname || '专家'}</h2>
            <p className="text-sm text-[#9CA3AF] truncate hidden sm:block">{user?.email}</p>
            <span className="inline-flex items-center mt-1 md:mt-2 px-2 md:px-3 py-0.5 md:py-1 bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold rounded-full">
              {roleLabel}
            </span>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#4B5563] hover:text-[#4F46E5] transition"
          >
            <span>首页</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="group bg-white rounded-2xl border border-[#E5E7EB] p-5 md:p-6 hover:border-[#4F46E5] hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-[#111827] group-hover:text-[#4F46E5] transition-colors">
                  {item.label}
                </h3>
                <p className="text-sm text-[#9CA3AF] mt-0.5">{item.desc}</p>
              </div>
              <div className="flex items-center text-[#D1D5DB] group-hover:text-[#4F46E5] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
          <p className="text-sm text-white/70">快速开始</p>
          <p className="text-lg font-semibold mt-1">发布您的第一篇文章</p>
          <Link
            to="/my/articles/new"
            className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-white/90 hover:text-white"
          >
            开始写作 →
          </Link>
        </div>
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
          <p className="text-sm text-white/70">帮助中心</p>
          <p className="text-lg font-semibold mt-1">了解平台使用方法</p>
          <Link
            to="/tags"
            className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-white/90 hover:text-white"
          >
            浏览标签 →
          </Link>
        </div>
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-5 text-white">
          <p className="text-sm text-white/70">社区动态</p>
          <p className="text-lg font-semibold mt-1">查看最新热门内容</p>
          <Link
            to="/"
            className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-white/90 hover:text-white"
          >
            返回首页 →
          </Link>
        </div>
      </div>
    </ResponsiveContainer>
  )
}