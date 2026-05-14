import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { apiRequest, showSuccess } from '@/lib/api-client'
import Pagination from '@/components/common/Pagination'
import { showConfirmDialog } from '@/components/common/ConfirmDialog'

dayjs.extend(relativeTime)

interface Article {
  _id: string
  title: string
  status: string
  createdAt: string
  updatedAt?: string
  rejectReason?: string
  content?: string
  coverImage?: string
  author?: any
  readCount?: number
  commentCount?: number
}

async function fetchArticles({ page = 1, pageSize = 20, status }: { page?: number; pageSize?: number; status?: string }) {
  return apiRequest({ action: 'list', data: { page, pageSize, status: status || undefined }, endpoint: 'articleCrud' })
}

async function approveArticle(articleId: string) {
  return apiRequest({ action: 'approve', data: { articleId }, endpoint: 'articleCrud' })
}

async function deleteArticle(articleId: string) {
  return apiRequest({ action: 'delete', data: { articleId }, endpoint: 'articleCrud' })
}

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  approved: { label: '已发布', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  pending: { label: '待审核', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  rejected: { label: '已驳回', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
}

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status, bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-500' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

export default function AdminArticleList() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-articles', page, statusFilter],
    queryFn: () => fetchArticles({ page, status: statusFilter || undefined }),
  })

  const approveMut = useMutation({
    mutationFn: approveArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] })
      showSuccess('文章已发布')
    },
  })

  const deleteMut = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] })
      showSuccess('文章已删除')
    },
  })

  const handleDelete = (articleId: string) => {
    showConfirmDialog({
      title: '确认删除',
      message: '删除后无法恢复，确定要删除这篇文章吗？',
      isDanger: true,
      onConfirm: () => deleteMut.mutate(articleId),
    })
  }

  const articles = data?.data?.list || []
  const total = data?.data?.total || 0

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="px-6 py-5 border-b border-[#E5E7EB] bg-white shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#111827]">文章管理</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">共 {total} 篇文章</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F3F4F6] rounded-lg px-3 py-2">
              <svg className="w-4 h-4 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <select
                className="text-sm text-[#4B5563] bg-transparent focus:outline-none cursor-pointer"
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
              >
                <option value="">全部状态</option>
                <option value="pending">待审核</option>
                <option value="approved">已发布</option>
                <option value="rejected">已驳回</option>
              </select>
            </div>
            <Link
              to="/admin/articles/new"
              className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition shadow-lg shadow-indigo-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>新建文章</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#F1F5F9] bg-[#FAFAFA] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#111827]">文章列表</h2>
            <span className="text-xs text-[#9CA3AF]">共 {total} 篇</span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3 text-[#9CA3AF]">
                <div className="w-6 h-6 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
                <span>加载中...</span>
              </div>
            </div>
          ) : articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 rounded-full bg-[#F3F4F6] flex items-center justify-center text-4xl mb-4">📝</div>
              <p className="text-[#6B7280] font-medium">暂无文章</p>
              <p className="text-sm text-[#9CA3AF] mt-1">创建第一篇文章开始创作</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-[#F1F5F9]">
                {articles.map((article: Article) => (
                  <div
                    key={article._id}
                    className="px-5 py-4 hover:bg-[#FAFAFA] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0 flex gap-3">
                        {article.coverImage && (
                          <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 hidden sm:block">
                            <img src={article.coverImage} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3
                            onClick={() => navigate(`/admin/articles/${article._id}`)}
                            className="text-sm font-semibold text-[#111827] line-clamp-2 hover:text-[#4F46E5] cursor-pointer transition-colors mb-1"
                          >
                            {article.title || '无标题文章'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#9CA3AF]">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {dayjs(article.createdAt).format('YYYY-MM-DD')}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              {article.readCount || 0} 阅读
                            </span>
                            {article.author && (
                              <span className="flex items-center gap-1">
                                <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white text-[8px] font-bold">
                                  {article.author.nickname?.[0]?.toUpperCase() || 'U'}
                                </div>
                                {article.author.nickname}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <StatusBadge status={article.status} />
                        <div className="flex items-center gap-1">
                          {article.status === 'pending' && (
                            <button
                              onClick={() => approveMut.mutate(article._id)}
                              disabled={approveMut.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition disabled:opacity-50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>快速发布</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(article._id)}
                          disabled={deleteMut.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>删除</span>
                        </button>
                      </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination page={page} pageSize={20} total={total} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}