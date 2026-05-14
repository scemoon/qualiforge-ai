import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import SectionBlock from '@/components/business/SectionBlock'
import ResponsiveContainer from '@/components/common/ResponsiveContainer'
import LoadingState from '@/components/common/LoadingState'
import { useAuthStore } from '@/store/authStore'
import { apiRequest } from '@/lib/api-client'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

async function fetchSections() {
  return apiRequest({ action: 'list', endpoint: 'sectionCrud' })
}

async function fetchSkillTags() {
  return apiRequest({ action: 'list', endpoint: 'skillCrud' })
}

async function fetchHotArticles() {
  return apiRequest({ action: 'list', data: { limit: 10, sortBy: 'readCount' }, endpoint: 'articleCrud' })
}

async function fetchStats() {
  return apiRequest({ action: 'stats', endpoint: 'articleCrud' })
}

function HotArticleItem({ article, rank }: { article: any; rank: number }) {
  const getRankColor = (r: number) => {
    if (r === 1) return 'bg-amber-500 text-white'
    if (r === 2) return 'bg-slate-400 text-white'
    if (r === 3) return 'bg-orange-400 text-white'
    return 'bg-[#F1F5F9] text-[#64748B]'
  }

  return (
    <Link
      to={`/articles/${article._id}`}
      className="flex items-start gap-3 py-2.5 border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC] -mx-3 px-3 rounded-lg transition"
    >
      <span className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${getRankColor(rank)}`}>
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-[#334155] line-clamp-2 leading-snug hover:text-[#4F46E5]">
          {article.title}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-xs text-[#94A3B8]">
          <span>{dayjs(article.publishedAt || article.createdAt).fromNow()}</span>
          <span>·</span>
          <span>{article.readCount || 0} 阅读</span>
        </div>
      </div>
    </Link>
  )
}

function StatsWidget() {
  const { data } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  })

  const stats = data?.data || {}

  return (
    <div className="bg-gradient-to-br from-[#1e1b4b] to-[#312e81] rounded-xl p-4 text-white">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        社区数据
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/10 rounded-lg p-2.5 text-center">
          <div className="text-xl font-bold">{stats.articleCount || 0}</div>
          <div className="text-xs text-white/60">文章</div>
        </div>
        <div className="bg-white/10 rounded-lg p-2.5 text-center">
          <div className="text-xl font-bold">{stats.userCount || 0}</div>
          <div className="text-xs text-white/60">用户</div>
        </div>
        <div className="bg-white/10 rounded-lg p-2.5 text-center">
          <div className="text-xl font-bold">{stats.viewCount || 0}</div>
          <div className="text-xs text-white/60">浏览</div>
        </div>
        <div className="bg-white/10 rounded-lg p-2.5 text-center">
          <div className="text-xl font-bold">{stats.todayCount || 0}</div>
          <div className="text-xs text-white/60">今日</div>
        </div>
      </div>
    </div>
  )
}

function RightSidebar() {
  const { data: hotData } = useQuery({
    queryKey: ['hot-articles'],
    queryFn: fetchHotArticles,
  })

  const hotArticles = hotData?.data?.list || hotData?.data || []

  return (
    <div className="space-y-4">
      <StatsWidget />

      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#F1F5F9]">
          <h3 className="text-sm font-semibold text-[#1e293b] flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            热门文章
          </h3>
        </div>
        <div className="p-2">
          {hotArticles.length > 0 ? (
            hotArticles.slice(0, 8).map((article: any, i: number) => (
              <HotArticleItem key={article._id} article={article} rank={i + 1} />
            ))
          ) : (
            <p className="text-sm text-[#94A3B8] py-6 text-center">暂无热门文章</p>
          )}
        </div>
        {hotArticles.length > 8 && (
          <Link
            to="/articles/search?sort=hot"
            className="block text-center text-sm text-[#4F46E5] hover:text-[#4338CA] py-2.5 border-t border-[#F1F5F9]"
          >
            查看全部 →
          </Link>
        )}
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
        <h3 className="text-sm font-semibold text-[#1e293b] mb-2">关于社区</h3>
        <p className="text-sm text-[#64748B] leading-relaxed">
          Forge AI 是一个专注于 AI Coding Verify的社区。
        </p>
        <div className="flex items-center gap-3 mt-3">
          <Link to="/cooperation" className="text-xs text-[#4F46E5] hover:text-[#4338CA]">社区合作</Link>
          <span className="text-[#E2E8F0]">·</span>
          <Link to="/rules" className="text-xs text-[#4F46E5] hover:text-[#4338CA]">社区准则</Link>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['sections'],
    queryFn: fetchSections,
  })

  const { data: skillData } = useQuery({
    queryKey: ['skill-tags'],
    queryFn: fetchSkillTags,
  })

  const skillTags = skillData?.data?.list || []
  const sections = data?.data?.list || []

  const normalizedSections = sections.map((s: any) => ({
    ...s.data,
    _id: s._id,
    type: s.data?.type || s.type,
    config: s.data?.config || s.config,
    articles: s.articles,
    evaluations: s.evaluations,
  }))

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/articles/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-50 flex-shrink-0">
        <ResponsiveContainer>
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white font-bold shadow-lg">
                  F
                </div>
                <span className="font-bold text-[#1e293b] hidden sm:block">QualiForge</span>
              </Link>
              <form onSubmit={handleSearch} className="hidden md:block">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索..."
                    className="w-48 lg:w-64 pl-9 pr-4 py-2 bg-[#F1F5F9] border border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </form>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white text-xs font-bold">
                      {user?.nickname?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden lg:block">
                      <p className="text-sm font-medium text-[#334155]">{user?.nickname}</p>
                      <p className="text-xs text-[#94A3B8]">{(user?.role ?? '') === 'admin' ? '管理员' : '专家'}</p>
                    </div>
                  </div>
                  {(user?.role ?? '') === 'admin' ? (
                    <Link
                      to="/admin"
                      className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:from-amber-400 hover:to-orange-400 transition shadow-lg shadow-amber-500/20"
                    >
                      管理
                    </Link>
                  ) : (
                    <Link
                      to="/my"
                      className="px-3 py-1.5 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-lg text-sm font-medium hover:from-[#4338CA] hover:to-[#6D28D9] transition shadow-lg shadow-indigo-500/20"
                    >
                      我的
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="p-2 text-[#64748B] hover:text-[#334155] hover:bg-[#F1F5F9] rounded-lg transition"
                    title="退出"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-[#4F46E5] hover:bg-[#F1F5F9] rounded-lg text-sm font-medium transition"
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-lg text-sm font-medium hover:from-[#4338CA] hover:to-[#6D28D9] transition shadow-lg shadow-indigo-500/20"
                  >
                    注册
                  </Link>
                </>
              )}
            </div>
          </div>
        </ResponsiveContainer>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#4c1d95] text-white flex-shrink-0">
        <ResponsiveContainer className="py-8 md:py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                Forge <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300">AI</span>
              </h1>
              <p className="text-white/70 text-sm">让AI生成每一行代码都可信</p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-white/80">社区在线</span>
            </div>
          </div>
        </ResponsiveContainer>
      </div>

      {/* Main Content - Flexible height */}
      <div className="flex-1">
        <ResponsiveContainer className="py-5">
          <div className="flex gap-5 h-full">
            {/* Main Column */}
            <main className="flex-1 min-w-0 flex flex-col">
              {/* Skill Tags */}
              {skillTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => { setActiveTab(0) }}
                    className="px-3 py-1.5 rounded-full text-sm font-medium bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                  >
                    全部
                  </button>
                  {skillTags.map((tag: any) => (
                    <span
                      key={tag._id}
                      className="px-3 py-1.5 rounded-full text-sm font-medium bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Section Tabs */}
              {normalizedSections.length > 0 && (
                <div className="bg-white rounded-xl border border-[#E5E7EB] mb-4 flex-shrink-0 overflow-hidden">
                  <div className="flex overflow-x-auto scrollbar-hide">
                    {normalizedSections.map((section: any, i: number) => (
                      <button
                        key={section._id}
                        onClick={() => { setActiveTab(i) }}
                        className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                          activeTab === i
                            ? 'border-[#4F46E5] text-[#4F46E5] bg-[#F8FAFC]'
                            : 'border-transparent text-[#64748B] hover:text-[#334155] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        {section.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Content - Flexible height */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] flex-1 overflow-auto">
                {isLoading ? (
                  <div className="p-8">
                    <LoadingState text="加载中..." />
                  </div>
                ) : normalizedSections.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-5xl mb-4">
                      🚀
                    </div>
                    <p className="text-lg font-semibold text-[#334155]">社区正在初始化</p>
                    <p className="text-sm text-[#94A3B8] mt-1">精彩内容即将呈现</p>
                  </div>
                ) : (
                  <div className="p-4">
                    {normalizedSections[activeTab] && (
                      <SectionBlock
                        section={normalizedSections[activeTab]}
                        skillTags={skillTags}
                      />
                    )}
                  </div>
                )}
              </div>
            </main>

            {/* Right Sidebar - Fixed width, scrollable */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-[73px]">
                <RightSidebar />
              </div>
            </aside>
          </div>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E7EB] flex-shrink-0">
        <ResponsiveContainer className="py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <span>Forge AI</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/about" className="hover:text-[#64748B] transition">关于我们</Link>
              <Link to="/terms" className="hover:text-[#64748B] transition">使用条款</Link>
              <Link to="/privacy" className="hover:text-[#64748B] transition">隐私政策</Link>
            </div>
          </div>
        </ResponsiveContainer>
      </footer>
    </div>
  )
}