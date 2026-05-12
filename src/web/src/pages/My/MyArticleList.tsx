import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import ResponsiveContainer from '../../components/common/ResponsiveContainer'

const API_BASE = 'https://cloud1-2gavd8kj8a1ce021.service.tcloudbase.com/api/forge'

async function fetchMyArticles({ page = 1, status }: { page?: number; status?: string }) {
  const res = await fetch(`${API_BASE}/article-crud`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'listMyArticles', data: { page, pageSize: 20, status: status || undefined } }),
  })
  return res.json()
}

async function deleteArticle(articleId: string) {
  const res = await fetch(`${API_BASE}/article-crud`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', data: { articleId } }),
  })
  return res.json()
}

const statusTag = (status: string) => {
  const map: Record<string, string> = {
    approved: 'bg-[#10B981] text-white',
    pending: 'bg-[#F59E0B] text-white',
    rejected: 'bg-[#EF4444] text-white',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs ${map[status] || 'bg-gray-200 text-[#4B5563]'}`}>{status || '未知'}</span>
}

export default function MyArticleList() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['my-articles', page, statusFilter],
    queryFn: () => fetchMyArticles({ page, status: statusFilter || undefined }),
  })

  const deleteMut = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-articles'] })
    },
  })

  const articles = data?.data?.list || []
  const total = data?.data?.total || 0

  const handleDelete = (articleId: string) => {
    if (window.confirm('确认删除这篇文章吗？')) {
      deleteMut.mutate(articleId)
    }
  }

  return (
    <ResponsiveContainer className="py-6 md:py-8">
      <div className="mb-4">
        <Link to="/forge/my/articles/new" className="inline-block px-4 py-2 bg-[#4F46E5] text-white rounded-md text-sm hover:bg-[#4338CA] transition">
          新建文章
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">我的文章</h1>
          <p className="text-sm text-[#6B7280] mt-1">查看、编辑和管理您已发布或草稿中的文章。</p>
        </div>
        <select
          className="border border-[#E5E7EB] rounded-md px-3 py-1.5 text-sm w-full sm:w-auto"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setPage(1)
          }}
        >
          <option value="">全部状态</option>
          <option value="pending">待审核</option>
          <option value="approved">已发布</option>
          <option value="rejected">已驳回</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-[#9CA3AF]">加载中...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3AF]">
          <p>还没有文章。</p>
          <Link to="articles/new" className="mt-3 inline-block text-sm text-[#4F46E5] hover:underline">发布第一篇文章 →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article: any) => (
            <div key={article._id} className="bg-white rounded-lg border border-[#E5E7EB] p-4 hover:shadow-sm transition">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                  <Link to={`/forge/articles/${article._id}`} className="text-lg font-semibold text-[#111827] hover:text-[#4F46E5] line-clamp-2">
                    {article.title || '无标题文章'}
                  </Link>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
                    <span>{dayjs(article.createdAt).format('YYYY-MM-DD HH:mm')}</span>
                    <span>·</span>
                    <span>{article.readCount ?? 0} 阅读</span>
                    <span>·</span>
                    <span>{article.commentCount ?? 0} 评论</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">{statusTag(article.status)}</div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[#4B5563]">
                <Link to={`/forge/articles/${article._id}`} className="text-[#4F46E5] hover:underline">查看</Link>
                <Link to={`/forge/article/${article._id}/edit`} className="text-[#4F46E5] hover:underline">编辑</Link>
                <button
                  type="button"
                  className="text-[#EF4444] hover:underline"
                  onClick={() => handleDelete(article._id)}
                >
                  删除
                </button>
              </div>
            </div>
          ))}

          {total > 20 && (
            <div className="flex flex-wrap items-center justify-center gap-2 px-4 py-3">
              <button
                className="px-4 py-2 border border-[#E5E7EB] rounded-md text-sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                上一页
              </button>
              <span className="px-4 py-2 text-sm text-[#4B5563]">{page} / {Math.ceil(total / 20)}</span>
              <button
                className="px-4 py-2 border border-[#E5E7EB] rounded-md text-sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page >= Math.ceil(total / 20)}
              >
                下一页
              </button>
            </div>
          )}
        </div>
      )}
    </ResponsiveContainer>
  )
}
