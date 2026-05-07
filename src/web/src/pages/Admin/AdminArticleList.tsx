import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ResponsiveContainer from '../../components/common/ResponsiveContainer'

async function fetchArticles({ page = 1, status }: { page?: number; status?: string }) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list', data: { page, pageSize: 20, status: status || undefined } }),
  })
  return res.json()
}

async function fetchArticle(articleId: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get', data: { articleId } }),
  })
  return res.json()
}

async function approveArticle(articleId: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'approve', data: { articleId } }),
  })
  return res.json()
}

async function rejectArticle(articleId: string, reason: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reject', data: { articleId, reason } }),
  })
  return res.json()
}

async function deleteArticle(articleId: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', data: { articleId } }),
  })
  return res.json()
}

const statusTag = (s: string) => {
  const map: Record<string, string> = {
    approved: 'bg-[#10B981] text-white', pending: 'bg-[#F59E0B] text-white', rejected: 'bg-[#EF4444] text-white',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs ${map[s] || 'bg-gray-200'}`}>{s}</span>
}

export default function AdminArticleList() {
  const location = useLocation()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedId, setSelectedId] = useState<string>(location.state?.articleId || '')
  const [rejectReason, setRejectReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-articles', page, statusFilter],
    queryFn: () => fetchArticles({ page, status: statusFilter || undefined }),
  })

  const { data: articleData, isLoading: loadingArticle } = useQuery({
    queryKey: ['article-review', selectedId],
    queryFn: () => fetchArticle(selectedId),
    enabled: !!selectedId,
  })

  const approveMut = useMutation({
    mutationFn: approveArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] })
      queryClient.invalidateQueries({ queryKey: ['article-review', selectedId] })
      setSelectedId('')
      setRejectReason('')
    },
  })

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectArticle(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] })
      queryClient.invalidateQueries({ queryKey: ['article-review', selectedId] })
      setSelectedId('')
      setRejectReason('')
    },
  })

  const deleteMut = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] })
      queryClient.invalidateQueries({ queryKey: ['article-review', selectedId] })
      setSelectedId('')
      setRejectReason('')
    },
  })

  const handleDelete = (articleId: string) => {
    if (window.confirm('确认删除这篇文章吗？')) {
      deleteMut.mutate(articleId)
    }
  }

  const articles = data?.data?.list || []
  const total = data?.data?.total || 0
  const selectedArticle = articleData?.data

  return (
    <ResponsiveContainer className="py-6 md:py-8">
      <div className="mb-4">
        <Link to="/admin/articles/new" className="inline-block px-4 py-2 bg-[#4F46E5] text-white rounded-md text-sm hover:bg-[#4338CA] transition">
          新建文章
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">文章管理</h1>
          <p className="text-sm text-[#6B7280] mt-1">列表筛选、审核与删除操作统一在此页面完成。</p>
        </div>
        <select
          className="border border-[#E5E7EB] rounded-md px-3 py-1.5 text-sm w-full sm:w-auto"
          value={statusFilter}
          onChange={e => {
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden lg:order-1 order-2">
          <div className="px-4 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <span className="text-sm font-medium text-[#4B5563]">文章列表 ({articles.length})</span>
          </div>

          {isLoading ? (
            <div className="p-6 text-center text-[#9CA3AF] text-sm">加载中...</div>
          ) : articles.length === 0 ? (
            <div className="p-6 text-center text-[#9CA3AF] text-sm">暂无文章</div>
          ) : (
            <div className="divide-y divide-[#F3F4F6] max-h-[600px] overflow-y-auto">
              {articles.map((article: any) => (
                <div
                  key={article._id}
                  className={`px-4 py-3 transition ${selectedId === article._id ? 'bg-[#EEF2FF]' : 'hover:bg-[#F9FAFB]'}`}
                  onClick={() => setSelectedId(article._id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#111827] line-clamp-2">{article.title}</p>
                      <p className="text-xs text-[#9CA3AF] mt-1">{dayjs(article.createdAt).format('YYYY-MM-DD HH:mm')}</p>
                    </div>
                    {statusTag(article.status)}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <Link
                      to={`/article/${article._id}`}
                      className="text-[#4F46E5] hover:underline"
                      onClick={e => e.stopPropagation()}
                    >
                      查看
                    </Link>
                    {article.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          className="text-[#10B981] hover:underline"
                          onClick={e => {
                            e.stopPropagation()
                            approveMut.mutate(article._id)
                          }}
                        >
                          发布
                        </button>
                        <button
                          type="button"
                          className="text-[#F59E0B] hover:underline"
                          onClick={e => {
                            e.stopPropagation()
                            setSelectedId(article._id)
                          }}
                        >
                          审核
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className="text-[#EF4444] hover:underline"
                      onClick={e => {
                        e.stopPropagation()
                        handleDelete(article._id)
                      }}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {total > 20 && (
            <div className="mt-4 md:mt-6 flex flex-wrap justify-center gap-2 px-4 py-3">
              <button
                className="px-4 py-2 border border-[#E5E7EB] rounded-md text-sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                上一页
              </button>
              <span className="px-4 py-2 text-sm text-[#4B5563]">{page} / {Math.ceil(total / 20)}</span>
              <button
                className="px-4 py-2 border border-[#E5E7EB] rounded-md text-sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / 20)}
              >
                下一页
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg border border-[#E5E7EB] p-4 md:p-6 lg:order-2 order-1">
          {!selectedId ? (
            <div className="text-center py-12 md:py-16 text-[#9CA3AF]">← 请选择左侧文章进行审核或删除</div>
          ) : loadingArticle ? (
            <div className="text-center py-12 md:py-16 text-[#9CA3AF]">加载中...</div>
          ) : !selectedArticle ? (
            <div className="text-center py-12 md:py-16 text-[#9CA3AF]">文章未找到或已被删除</div>
          ) : (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-[#111827]">{selectedArticle.title}</h2>
                  <p className="text-xs md:text-sm text-[#9CA3AF] mt-1">
                    {dayjs(selectedArticle.createdAt).format('YYYY-MM-DD HH:mm')}
                  </p>
                </div>
                {statusTag(selectedArticle.status)}
              </div>

              <div className="prose max-w-none text-sm text-[#4B5563] mb-4 md:mb-6 max-h-48 md:max-h-64 overflow-y-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {(selectedArticle.content || '').slice(0, 500)}
                </ReactMarkdown>
              </div>

              {selectedArticle.status === 'rejected' && selectedArticle.rejectReason && (
                <div className="mb-4 p-4 rounded-md bg-[#FEF3C7] border border-[#FDE68A] text-sm text-[#92400E]">
                  驳回原因：{selectedArticle.rejectReason}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 pt-4 border-t border-[#E5E7EB]">
                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                  {selectedArticle.status === 'pending' && (
                    <>
                      <button
                        onClick={() => approveMut.mutate(selectedId)}
                        disabled={approveMut.isPending}
                        className="px-5 py-2 bg-[#10B981] text-white rounded-md text-sm hover:bg-[#059669] transition disabled:opacity-50"
                      >
                        {approveMut.isPending ? '处理中...' : '✅ 通过'}
                      </button>
                      <input
                        type="text"
                        placeholder="驳回原因（可选）"
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        className="flex-1 border border-[#E5E7EB] rounded-md px-3 py-1.5 text-sm"
                      />
                      <button
                        onClick={() => rejectMut.mutate({ id: selectedId, reason: rejectReason })}
                        disabled={rejectMut.isPending}
                        className="px-4 py-1.5 bg-[#EF4444] text-white rounded-md text-sm hover:bg-[#DC2626] transition disabled:opacity-50 whitespace-nowrap"
                      >
                        驳回
                      </button>
                    </>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(selectedId)}
                  disabled={deleteMut.isPending}
                  className="px-5 py-2 bg-[#EF4444] text-white rounded-md text-sm hover:bg-[#DC2626] transition disabled:opacity-50"
                >
                  {deleteMut.isPending ? '处理中...' : '删除文章'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ResponsiveContainer>
  )
}
