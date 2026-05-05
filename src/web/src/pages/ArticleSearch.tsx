import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'

async function fetchArticles(params: { tagId?: string; keyword?: string; page?: number }) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/article-crud', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list', data: params }),
  })
  return res.json()
}

async function fetchTags() {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/article-crud', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'listTags' }),
  })
  return res.json()
}

export default function ArticleSearch() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tagId = searchParams.get('tag') || undefined
  const keyword = searchParams.get('keyword') || undefined
  const page = parseInt(searchParams.get('page') || '1')

  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['articles', { tagId, keyword, page }],
    queryFn: () => fetchArticles({ tagId, keyword, page }),
  })
  const { data: tagsData } = useQuery({ queryKey: ['tags'], queryFn: fetchTags })

  const articles = articlesData?.data?.list || []
  const total = articlesData?.data?.total || 0
  const tags = tagsData?.data?.list || []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#111827] mb-6">文章</h1>

      {/* Search bar */}
      <div className="mb-6 flex gap-3">
        <input
          type="text"
          placeholder="搜索文章..."
          className="flex-1 border border-[#E5E7EB] rounded-md px-4 py-2 text-sm"
          defaultValue={keyword}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const v = (e.target as HTMLInputElement).value
              setSearchParams(v ? { keyword: v } : {})
            }
          }}
        />
      </div>

      {/* Tags filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          className={`px-3 py-1 rounded-full text-sm border ${!tagId ? 'bg-[#4F46E5] text-white border-[#4F46E5]' : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#4F46E5]'}`}
          onClick={() => setSearchParams({})}
        >
          全部
        </button>
        {tags.map((tag: any) => (
          <button
            key={tag._id}
            className={`px-3 py-1 rounded-full text-sm border ${tagId === tag._id ? 'bg-[#4F46E5] text-white border-[#4F46E5]' : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#4F46E5]'}`}
            onClick={() => setSearchParams({ tag: tag._id })}
          >
            {tag.name}
          </button>
        ))}
      </div>

      {/* Article list */}
      {isLoading ? (
        <div className="text-center py-12 text-[#9CA3AF]">加载中...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3AF]">
          <p>暂无文章</p>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article: any) => (
            <Link key={article._id} to={`/article/${article._id}`} className="block bg-white rounded-lg border border-[#E5E7EB] p-4 hover:shadow-md transition">
              <h3 className="font-medium text-[#111827] mb-2">{article.title}</h3>
              <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
                <span>{article.author?.nickname}</span>
                <span>·</span>
                <span>{dayjs(article.publishedAt || article.createdAt).format('YYYY-MM-DD')}</span>
                <span>·</span>
                <span>{article.readCount || 0} 阅读</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <button
              className="px-4 py-2 border border-[#E5E7EB] rounded-md text-sm"
              onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: String(page - 1) })}
            >
              上一页
            </button>
          )}
          <span className="px-4 py-2 text-sm text-[#4B5563]">
            第 {page} 页，共 {Math.ceil(total / 20)} 页
          </span>
          {page < Math.ceil(total / 20) && (
            <button
              className="px-4 py-2 border border-[#E5E7EB] rounded-md text-sm"
              onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: String(page + 1) })}
            >
              下一页
            </button>
          )}
        </div>
      )}
    </div>
  )
}
