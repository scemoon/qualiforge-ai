import { useQuery } from '@tanstack/react-query'

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
    <div>
      <h1 className="text-2xl font-bold text-[#111827] mb-6">控制台</h1>
      {isLoading ? (
        <div className="text-[#9CA3AF]">加载中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
            <p className="text-sm text-[#4B5563]">文章总数</p>
            <p className="text-3xl font-bold text-[#111827] mt-1">{data?.articleCount ?? '-'}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
            <p className="text-sm text-[#4B5563]">用户总数</p>
            <p className="text-3xl font-bold text-[#111827] mt-1">{data?.userCount ?? '-'}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
            <p className="text-sm text-[#4B5563]">Skill 总数</p>
            <p className="text-3xl font-bold text-[#111827] mt-1">{data?.skillCount ?? '-'}</p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-bold text-[#111827] mb-4">快速操作</h2>
        <div className="flex flex-wrap gap-3">
          <a href="/admin/articles/review" className="px-4 py-2 bg-[#F59E0B] text-white rounded-md text-sm hover:bg-[#D97706] transition">审核文章</a>
          <a href="/admin/skills" className="px-4 py-2 bg-[#4F46E5] text-white rounded-md text-sm hover:bg-[#4338CA] transition">管理 Skill</a>
          <a href="/admin/sections" className="px-4 py-2 bg-[#10B981] text-white rounded-md text-sm hover:bg-[#059669] transition">管理板块</a>
        </div>
      </div>

      <div className="mt-8 p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
        <p className="text-sm text-[#4B5563]">📌 当前 CloudBase 环境</p>
        <p className="text-sm font-mono text-[#111827] mt-1">cloud1-2gavd8kj8a1ce021</p>
      </div>
    </div>
  )
}
