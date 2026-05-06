import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import SectionBlock from '../components/business/SectionBlock'
import ResponsiveContainer from '../components/common/ResponsiveContainer'
import { useAuthStore } from '../store/authStore'

// API endpoint
const API_BASE = 'https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com'

async function fetchSections() {
  try {
    const res = await fetch(`${API_BASE}/section-crud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list' }),
    })
    return res.json()
  } catch (e) {
    console.error('fetchSections error:', e)
    return { data: { list: [] }, error: String(e) }
  }
}

export default function Home() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['sections'],
    queryFn: fetchSections,
  })

  const sections = data?.data?.list || []
  // API returns { _id, data: { title, type, ... } } structure
  const normalizedSections = sections.map((s: any) => ({
    ...s.data,
    _id: s._id,
    type: s.data?.type || s.type,
    config: s.data?.config || s.config,
    articles: s.articles,
    evaluations: s.evaluations,
  }))
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      {/* Hero + Login */}
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white">
        <ResponsiveContainer className="py-8 md:py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
                QualiForge <span className="text-indigo-400">AI</span>
              </h1>
              <p className="text-white/60 text-sm sm:text-base max-w-xl hidden sm:block">
                系统化评估、验证、提升 AI Coding 质量 — 让每一行 AI 生成代码都可信
              </p>
            </div>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-white/80 text-sm hidden sm:inline">{user?.nickname || user?.email}</span>
                {user?.role === 'admin' ? (
                  <Link to="/admin" className="px-4 py-2 bg-[#F59E0B] text-white rounded-lg font-semibold text-sm hover:bg-[#D97706] transition">管理后台</Link>
                ) : (
                  <Link to="/my" className="px-4 py-2 bg-[#4F46E5] text-white rounded-lg font-semibold text-sm hover:bg-[#4338CA] transition">专家中心</Link>
                )}
                <button onClick={logout} className="px-4 py-2 border border-white/30 text-white/80 rounded-lg text-sm hover:bg-white/10 transition">退出</button>
              </div>
            ) : (
              <Link to="/login" className="flex-shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 bg-white text-[#4F46E5] rounded-lg font-semibold text-sm hover:bg-indigo-50 transition w-full sm:w-auto text-center">
                登录 / 注册
              </Link>
            )}
          </div>
        </ResponsiveContainer>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <ResponsiveContainer>
          <div className="flex gap-0 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {normalizedSections.map((section: any, i: number) => (
              <button
                key={section._id}
                onClick={() => setActiveTab(i)}
                className={`px-4 sm:px-5 py-3 sm:py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === i
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </ResponsiveContainer>
      </div>

      {/* Main Content */}
      <ResponsiveContainer className="py-6 md:py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-[#6B7280]">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>加载中...</span>
            </div>
          </div>
        ) : normalizedSections.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#9CA3AF] text-lg">社区正在初始化</p>
          </div>
        ) : (
          <div>
            {normalizedSections[activeTab] && (
              <SectionBlock section={normalizedSections[activeTab]} />
            )}
          </div>
        )}
      </ResponsiveContainer>
    </div>
  )
}