import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ResponsiveContainer from '@/components/common/ResponsiveContainer'
import { apiRequest } from '@/lib/api-client'

async function fetchStats() {
  try {
    const [articlesRes, usersRes, skillsRes] = await Promise.all([
      apiRequest({ action: 'list', data: { page: 1, pageSize: 1 }, endpoint: 'articleCrud' }).catch(() => ({ data: { total: 0 } })),
      apiRequest({ action: 'list', data: { page: 1, pageSize: 1 }, endpoint: 'userCrud' }).catch(() => ({ data: { total: 0 } })),
      apiRequest({ action: 'list', endpoint: 'skillCrud' }).catch(() => ({ data: { list: [] } })),
    ])
    return {
      articleCount: articlesRes?.data?.total || 0,
      userCount: usersRes?.data?.total || 0,
      skillCount: skillsRes?.data?.list?.length || 0,
    }
  } catch {
    return { articleCount: 0, userCount: 0, skillCount: 0 }
  }
}

const statCards = [
  { label: '文章总数', key: 'articleCount', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'from-indigo-500 to-purple-600', bg: 'bg-indigo-50', text: 'text-indigo-600' },
  { label: '用户总数', key: 'userCount', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { label: '技能标签', key: 'skillCount', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z', color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', text: 'text-amber-600' },
]

const quickActions = [
  { path: '/admin/articles/new', label: '发布文章', desc: '创建新的专业内容', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', color: 'from-violet-500 to-purple-600' },
  { path: '/admin/articles', label: '文章管理', desc: '管理所有文章', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'from-blue-500 to-cyan-600' },
  { path: '/admin/evaluations', label: '评测管理', desc: '管理 AI 评测', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', color: 'from-emerald-500 to-teal-600' },
  { path: '/admin/sections', label: '板块管理', desc: '管理首页板块', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', color: 'from-amber-500 to-orange-600' },
]

export default function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchStats,
  })

  return (
    <ResponsiveContainer className="py-8 md:py-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#111827]">管理后台</h1>
        <p className="text-[#6B7280] mt-1">监控平台数据，管理内容和配置</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-8">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="bg-white rounded-2xl border border-[#E5E7EB] p-5 md:p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[#6B7280]">{card.label}</p>
                <p className="text-3xl font-bold text-[#111827] mt-2">{data?.[card.key as keyof typeof data] ?? '-'}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                <svg className={`w-6 h-6 ${card.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                </svg>
              </div>
            </div>
            <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${card.color}`} />
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#111827] mb-4">快速操作</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="group bg-white rounded-2xl border border-[#E5E7EB] p-5 hover:border-transparent hover:shadow-xl transition-all duration-200"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                </svg>
              </div>
              <h3 className="font-semibold text-[#111827] group-hover:text-[#4F46E5] transition-colors">{action.label}</h3>
              <p className="text-sm text-[#9CA3AF] mt-0.5">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white">
        <h2 className="text-lg font-bold">欢迎使用 QualiForge 管理后台</h2>
        <p className="text-white/70 mt-1 text-sm">您可以管理文章、用户、评测和板块配置</p>
        <div className="flex flex-wrap gap-3 mt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition"
          >
            <span>访问前台</span>
            <span>→</span>
          </Link>
          <Link
            to="/admin/articles"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#4F46E5] hover:bg-indigo-50 rounded-lg text-sm font-medium transition"
          >
            管理文章 →
          </Link>
        </div>
      </div>
    </ResponsiveContainer>
  )
}