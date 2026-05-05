import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

async function fetchUser(userId: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/user-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get', data: { userId } }),
  })
  return res.json()
}

async function fetchUserArticles(authorId: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list', data: { authorId, page: 1, pageSize: 10 } }),
  })
  return res.json()
}

export default function ExpertProfile() {
  const { id } = useParams()
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['expert', id],
    queryFn: () => fetchUser(id!),
    enabled: !!id,
  })

  const { data: articlesData } = useQuery({
    queryKey: ['expert-articles', id],
    queryFn: () => fetchUserArticles(id!),
    enabled: !!id,
  })

  const user = userData?.data
  const articles = articlesData?.data?.list || []

  if (userLoading) return <div className="text-center py-16 text-[#9CA3AF]">加载中...</div>

  if (!user) return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold text-[#111827]">专家不存在</h1>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-2xl font-bold">
          {user.nickname?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">{user.nickname}</h1>
          <p className="text-sm text-[#4B5563]">{user.email}</p>
          {user.company && <p className="text-sm text-[#9CA3AF] mt-1">{user.company}</p>}
          {user.bio && <p className="text-sm text-[#4B5563] mt-2">{user.bio}</p>}
          <span className="inline-block mt-2 px-2 py-0.5 bg-[#4F46E5] text-white text-xs rounded-full">
            {user.role === 'admin' ? '管理员' : '专家'}
          </span>
        </div>
      </div>

      {/* Articles */}
      <h2 className="text-lg font-bold text-[#111827] mb-4">发布文章 ({articles.length})</h2>
      {articles.length === 0 ? (
        <div className="text-center py-12 text-[#9CA3AF] bg-white rounded-lg border border-[#E5E7EB]">暂无文章</div>
      ) : (
        <div className="space-y-3">
          {articles.map((article: any) => (
            <a key={article._id} href={`/article/${article._id}`} className="block bg-white rounded-lg border border-[#E5E7EB] p-4 hover:shadow-md transition">
              <h3 className="font-medium text-[#111827] mb-2">{article.title}</h3>
              <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                <span>{article.readCount || 0} 阅读</span>
                <span>·</span>
                <span>{article.status}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
