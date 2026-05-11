import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ResponsiveContainer from '../../components/common/ResponsiveContainer'

interface Article {
  _id: string
  title: string
  status: string
  createdAt: string
  updatedAt?: string
  rejectReason?: string
  content?: string
  author?: string
}

interface DetailModalProps {
  article: Article | null
  isOpen: boolean
  onClose: () => void
  onApprove: (id: string) => void
  onReject: (id: string, reason: string) => void
  isProcessing: boolean
}

async function fetchArticles({ page = 1, status }: { page?: number; status?: string }) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021.service.tcloudbase.com/forge/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list', data: { page, pageSize: 20, status: status || undefined } }),
  })
  return res.json()
}

async function fetchArticle(articleId: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021.service.tcloudbase.com/forge/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get', data: { articleId } }),
  })
  return res.json()
}

async function approveArticle(articleId: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021.service.tcloudbase.com/forge/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'approve', data: { articleId } }),
  })
  return res.json()
}

async function rejectArticle(articleId: string, reason: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021.service.tcloudbase.com/forge/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reject', data: { articleId, reason } }),
  })
  return res.json()
}

async function deleteArticle(articleId: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021.service.tcloudbase.com/forge/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', data: { articleId } }),
  })
  return res.json()
}

const statusTag = (s: string) => {
  const map: Record<string, string> = {
    approved: 'bg-[#10B981] text-white', 
    pending: 'bg-[#F59E0B] text-white', 
    rejected: 'bg-[#EF4444] text-white',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs ${map[s] || 'bg-gray-200'}`}>{s}</span>
}

function DetailModal({ article, isOpen, onClose, onApprove, onReject, isProcessing }: DetailModalProps) {
  const [rejectReason, setRejectReason] = useState('')

  if (!isOpen || !article) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#111827]">{article.title}</h2>
          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#6B7280] text-xl"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-[#9CA3AF]">创建于：{dayjs(article.createdAt).format('YYYY-MM-DD HH:mm')}</p>
              {article.updatedAt && (
                <p className="text-xs text-[#9CA3AF]">更新于：{dayjs(article.updatedAt).format('YYYY-MM-DD HH:mm')}</p>
              )}
            </div>
            {statusTag(article.status)}
          </div>

          {article.rejectReason && (
            <div className="p-3 rounded-md bg-[#FEF3C7] border border-[#FDE68A] text-sm text-[#92400E]">
              驳回原因：{article.rejectReason}
            </div>
          )}

          <div className="prose max-w-none text-sm text-[#4B5563] max-h-64 overflow-y-auto border-t border-[#E5E7EB] pt-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {(article.content || '').slice(0, 1000)}
            </ReactMarkdown>
          </div>
        </div>

        <div className="border-t border-[#E5E7EB] px-6 py-4 bg-[#F9FAFB]">
          <div className="flex flex-col gap-3">
            {article.status === 'pending' && (
              <>
                <div className="flex gap-2 items-end">
                  <input
                    type="text"
                    placeholder="驳回原因（可选）"
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    className="flex-1 border border-[#E5E7EB] rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onApprove(article._id)}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 bg-[#10B981] text-white rounded-md text-sm hover:bg-[#059669] transition disabled:opacity-50"
                  >
                    {isProcessing ? '处理中...' : '✅ 发布'}
                  </button>
                  <button
                    onClick={() => {
                      onReject(article._id, rejectReason)
                      setRejectReason('')
                    }}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 bg-[#EF4444] text-white rounded-md text-sm hover:bg-[#DC2626] transition disabled:opacity-50"
                  >
                    {isProcessing ? '处理中...' : '驳回'}
                  </button>
                </div>
              </>
            )}
            <button
              onClick={onClose}
              className="w-full px-4 py-2 border border-[#E5E7EB] rounded-md text-sm text-[#6B7280] hover:bg-[#F9FAFB]"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminArticleList() {
  const location = useLocation()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedId, setSelectedId] = useState<string>(location.state?.articleId || '')
  const [detailOpen, setDetailOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-articles', page, statusFilter],
    queryFn: () => fetchArticles({ page, status: statusFilter || undefined }),
  })

  const { data: articleData } = useQuery({
    queryKey: ['article-review', selectedId],
    queryFn: () => fetchArticle(selectedId),
    enabled: !!selectedId && detailOpen,
  })

  const approveMut = useMutation({
    mutationFn: approveArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] })
      queryClient.invalidateQueries({ queryKey: ['article-review', selectedId] })
      setDetailOpen(false)
      setSelectedId('')
    },
  })

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectArticle(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] })
      queryClient.invalidateQueries({ queryKey: ['article-review', selectedId] })
      setDetailOpen(false)
      setSelectedId('')
    },
  })

  const deleteMut = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] })
      setSelectedId('')
    },
  })

  const handleDelete = (articleId: string) => {
    if (window.confirm('确认删除这篇文章吗？')) {
      deleteMut.mutate(articleId)
    }
  }

  const handleQuickApprove = (articleId: string) => {
    approveMut.mutate(articleId)
  }

  const handleOpenDetail = (articleId: string) => {
    setSelectedId(articleId)
    setDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setDetailOpen(false)
    setTimeout(() => setSelectedId(''), 300)
  }

  const articles = data?.data?.list || []
  const total = data?.data?.total || 0
  const selectedArticle = articleData?.data

  return (
    <ResponsiveContainer className="py-6 md:py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">文章管理</h1>
          <p className="text-sm text-[#6B7280] mt-1">文章列表、审核和删除操作</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <select
            className="flex-1 sm:flex-initial border border-[#E5E7EB] rounded-md px-3 py-2 text-sm"
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
          <Link 
            to="/forge/admin/articles/new" 
            className="flex-1 sm:flex-initial px-4 py-2 bg-[#4F46E5] text-white rounded-md text-sm hover:bg-[#4338CA] transition text-center"
          >
            新建文章
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className="px-4 md:px-6 py-3 text-left text-sm font-medium text-[#4B5563]">标题</th>
                <th className="px-4 md:px-6 py-3 text-left text-sm font-medium text-[#4B5563] hidden sm:table-cell">状态</th>
                <th className="px-4 md:px-6 py-3 text-left text-sm font-medium text-[#4B5563] hidden md:table-cell">创建时间</th>
                <th className="px-4 md:px-6 py-3 text-right text-sm font-medium text-[#4B5563]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-4 md:px-6 py-8 text-center text-[#9CA3AF] text-sm">
                    加载中...
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 md:px-6 py-8 text-center text-[#9CA3AF] text-sm">
                    暂无文章
                  </td>
                </tr>
              ) : (
                articles.map((article: Article) => (
                  <tr key={article._id} className="hover:bg-[#F9FAFB] transition">
                    <td className="px-4 md:px-6 py-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#111827] line-clamp-2">{article.title}</p>
                        <div className="sm:hidden mt-1 flex items-center gap-2">
                          {statusTag(article.status)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 hidden sm:table-cell">
                      {statusTag(article.status)}
                    </td>
                    <td className="px-4 md:px-6 py-4 hidden md:table-cell text-sm text-[#7F8590]">
                      {dayjs(article.createdAt).format('YYYY-MM-DD HH:mm')}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <button
                          onClick={() => handleOpenDetail(article._id)}
                          className="text-[#4F46E5] hover:underline text-xs md:text-sm whitespace-nowrap"
                        >
                          详情
                        </button>
                        {article.status === 'pending' && (
                          <button
                            onClick={() => handleQuickApprove(article._id)}
                            disabled={approveMut.isPending}
                            className="text-[#10B981] hover:underline text-xs md:text-sm whitespace-nowrap disabled:opacity-50"
                          >
                            发布
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(article._id)}
                          disabled={deleteMut.isPending}
                          className="text-[#EF4444] hover:underline text-xs md:text-sm whitespace-nowrap disabled:opacity-50"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 20 && (
          <div className="flex flex-wrap justify-center gap-2 px-4 py-4 bg-[#F9FAFB] border-t border-[#E5E7EB]">
            <button
              className="px-3 py-1.5 border border-[#E5E7EB] rounded-md text-sm text-[#6B7280] hover:bg-white disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              上一页
            </button>
            <span className="px-3 py-1.5 text-sm text-[#4B5563]">
              {page} / {Math.ceil(total / 20)}
            </span>
            <button
              className="px-3 py-1.5 border border-[#E5E7EB] rounded-md text-sm text-[#6B7280] hover:bg-white disabled:opacity-50"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / 20)}
            >
              下一页
            </button>
          </div>
        )}
      </div>

      <DetailModal
        article={selectedArticle}
        isOpen={detailOpen}
        onClose={handleCloseDetail}
        onApprove={() => approveMut.mutate(selectedId)}
        onReject={(id, reason) => rejectMut.mutate({ id, reason })}
        isProcessing={approveMut.isPending || rejectMut.isPending}
      />
    </ResponsiveContainer>
  )
}
