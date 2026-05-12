import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import ResponsiveContainer from '../../components/common/ResponsiveContainer'

async function fetchCollections() {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021.service.tcloudbase.com/api/forge/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'myCollections', data: { page: 1, pageSize: 20 } }),
  })
  return res.json()
}

export default function MyCollection() {
  const { data, isLoading } = useQuery({ queryKey: ['my-collections'], queryFn: fetchCollections })
  const articles = data?.data?.list || []

  return (
    <ResponsiveContainer className="py-6 md:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-4 md:mb-6">我的收藏</h1>

      {isLoading ? (
        <div className="text-center py-12 text-[#9CA3AF]">加载中...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3AF]">
          <p>还没有收藏任何文章</p>
          <Link to="/articles/search" className="mt-3 inline-block text-sm text-[#4F46E5] hover:underline">去浏览 →</Link>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {articles.map((article: any) => (
            <Link key={article._id} to={`/articles/${article._id}`} className="block bg-white rounded-lg border border-[#E5E7EB] p-4 hover:shadow-md transition">
              <h3 className="font-medium text-[#111827] mb-2 line-clamp-2">{article.title}</h3>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#9CA3AF]">
                <span>{article.authorId || '匿名'}</span>
                <span>·</span>
                <span>{dayjs(article.publishedAt || article.createdAt).format('YYYY-MM-DD')}</span>
                <span>·</span>
                <span>{article.readCount || 0} 阅读</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </ResponsiveContainer>
  )
}