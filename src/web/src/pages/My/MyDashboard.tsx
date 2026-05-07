import { useAuthStore } from '../../store/authStore'
import { Link } from 'react-router-dom'
import ResponsiveContainer from '../../components/common/ResponsiveContainer'

export default function MyDashboard() {
  const { user } = useAuthStore()

  return (
    <ResponsiveContainer className="py-6 md:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-4 md:mb-6">我的主页</h1>

      <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 sm:p-6 mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-xl sm:text-2xl font-bold flex-shrink-0">
            {user?.nickname?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-lg sm:text-xl font-bold text-[#111827]">{user?.nickname || '专家'}</h2>
            <p className="text-sm text-[#9CA3AF]">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-[#EEF2FF] text-[#4F46E5] text-xs rounded-full font-medium">
              {user?.role === 'admin' ? '管理员' : '专家'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link to="/my/article/new" className="bg-white rounded-lg border border-[#E5E7EB] p-4 text-center hover:border-[#4F46E5] transition">
          <span className="text-2xl">✏️</span>
          <p className="text-sm font-medium text-[#111827] mt-2">发布文章</p>
        </Link>
        <Link to="/my/articles" className="bg-white rounded-lg border border-[#E5E7EB] p-4 text-center hover:border-[#4F46E5] transition">
          <span className="text-2xl">📝</span>
          <p className="text-sm font-medium text-[#111827] mt-2">我的文章</p>
        </Link>
        <Link to="/my/collection" className="bg-white rounded-lg border border-[#E5E7EB] p-4 text-center hover:border-[#4F46E5] transition">
          <span className="text-2xl">❤️</span>
          <p className="text-sm font-medium text-[#111827] mt-2">我的收藏</p>
        </Link>
        <Link to="/my/notifications" className="bg-white rounded-lg border border-[#E5E7EB] p-4 text-center hover:border-[#4F46E5] transition">
          <span className="text-2xl">🔔</span>
          <p className="text-sm font-medium text-[#111827] mt-2">通知中心</p>
        </Link>
        <a href="/" className="bg-white rounded-lg border border-[#E5E7EB] p-4 text-center hover:border-[#4F46E5] transition">
          <span className="text-2xl">📚</span>
          <p className="text-sm font-medium text-[#111827] mt-2">浏览文章</p>
        </a>
      </div>
    </ResponsiveContainer>
  )
}