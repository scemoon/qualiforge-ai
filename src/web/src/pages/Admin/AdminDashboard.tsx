import { useQuery } from '@tanstack/react-query'
import ResponsiveContainer from '../../components/common/ResponsiveContainer'

async function fetchStats() {
  const [articlesRes, usersRes, skillsRes] = await Promise.all([
    fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/article-crud', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list', data: { page: 1, pageSize: 1 } }),
    }),
    fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/user-crud', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list', data: { page: 1, pageSize: 1 } }),
    }),
    fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/skill-crud', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list' }),
    }),
  ])
  const articles = await articlesRes.json()
  const users = await usersRes.json()
  const skills = await skillsRes.json()
  return {
    articleCount: articles?.data?.total || 0,
    userCount: users?.data?.total || 0,
    skillCount: skills?.data?.list?.length || 0,
  }
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: fetchStats })

  return (
    <ResponsiveContainer className="py-6 md:py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-4 md:mb-6">首页</h1>

      {isLoading ? (
        <div className="text-center py-12 text-[#9CA3AF]">加载中...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 md:p-6">
            <p className="text-sm text-[#4B5563]">文章总数</p>
            <p className="text-3xl font-bold text-[#111827] mt-1">{data?.articleCount ?? '-'}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 md:p-6">
            <p className="text-sm text-[#4B5563]">用户总数</p>
            <p className="text-3xl font-bold text-[#111827] mt-1">{data?.userCount ?? '-'}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 md:p-6 sm:col-span-2 md:col-span-1">
            <p className="text-sm text-[#4B5563]">Skill 总数</p>
            <p className="text-3xl font-bold text-[#111827] mt-1">{data?.skillCount ?? '-'}</p>
          </div>
        </div>
      )}

      <div className="mt-6 md:mt-8">
        <h2 className="text-base sm:text-lg font-bold text-[#111827] mb-3 md:mb-4">快速操作</h2>
        <div className="flex flex-wrap gap-2 md:gap-3">
          <a href="/my/article/new" className="px-4 py-2 bg-[#4F46E5] text-white rounded-md text-sm hover:bg-[#4338CA] transition">新建文章</a>
          <a href="/admin/articles" className="px-4 py-2 bg-[#F59E0B] text-white rounded-md text-sm hover:bg-[#D97706] transition">文章管理</a>
          <a href="/admin/evaluations" className="px-4 py-2 bg-[#4F46E5] text-white rounded-md text-sm hover:bg-[#4338CA] transition">评测管理</a>
          <a href="/admin/sections" className="px-4 py-2 bg-[#10B981] text-white rounded-md text-sm hover:bg-[#059669] transition">管理板块</a>
        </div>
      </div>

      <div className="mt-6 md:mt-8 p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
        <p className="text-sm text-[#4B5563]">📌 当前 CloudBase 环境</p>
        <p className="text-sm font-mono text-[#111827] mt-1 break-all">cloud1-2gavd8kj8a1ce021</p>
      </div>
    </ResponsiveContainer>
  )
}