import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import ResponsiveContainer from '../components/common/ResponsiveContainer'

async function fetchExpertProfile(userId: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/forge-user-crud', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get', data: { userId } }),
  })
  return res.json()
}

async function fetchExpertArticles(userId: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/forge-article-crud', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list', data: { authorId: userId } }),
  })
  return res.json()
}

export default function ExpertProfile() {
  const { id } = useParams()
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['expert', id],
    queryFn: () => fetchExpertProfile(id!),
    enabled: !!id,
  })
  const { data: articlesData } = useQuery({
    queryKey: ['expert-articles', id],
    queryFn: () => fetchExpertArticles(id!),
    enabled: !!id,
  })

  const user = profileData?.data
  const articles = articlesData?.data?.list || []

  if (isLoading) return (
    <ResponsiveContainer className="py-12 text-center">
      <span className="text-[#9CA3AF]">加载中...</span>
    </ResponsiveContainer>
  )
  if (!user) return (
    <ResponsiveContainer className="py-12 text-center">
      <span className="text-[#EF4444]">用户不存在</span>
    </ResponsiveContainer>
  )

  return (
    <ResponsiveContainer className="py-6 md:py-8">
      {/* Profile header */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 md:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {user.nickname?.charAt(0).toUpperCase() || 'U'}
          </div>
          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-1">{user.nickname}</h1>
            <p className="text-sm text-[#9CA3AF] mb-2">{user.email}</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-[#FEF3C7] text-[#D97706]' : 'bg-[#DBEAFE] text-[#2563EB]'}`}>
                {user.role === 'admin' ? '管理员' : '专家'}
              </span>
              <span className="text-xs text-[#9CA3AF]">加入于 {dayjs(user.createdAt).format('YYYY-MM-DD')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Articles */}
      <div>
        <h2 className="text-lg font-bold text-[#111827] mb-4">他的文章</h2>
        {articles.length === 0 ? (
          <div className="text-center py-8 text-[#9CA3AF]">暂无文章</div>
        ) : (
          <div className="space-y-3">
            {articles.map((article: any) => (
              <Link key={article._id} to={`/forge/article/${article._id}`} className="block bg-white rounded-lg border border-[#E5E7EB] p-4 hover:shadow-md transition">
                <h3 className="font-medium text-[#111827] mb-2 line-clamp-2">{article.title}</h3>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#9CA3AF]">
                  <span>{dayjs(article.publishedAt || article.createdAt).format('YYYY-MM-DD')}</span>
                  <span>·</span>
                  <span>{article.readCount || 0} 阅读</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </ResponsiveContainer>
  )
}