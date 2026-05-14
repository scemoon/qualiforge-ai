import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import ResponsiveContainer from '../../components/common/ResponsiveContainer'
import { apiRequest, showSuccess } from '../../lib/api-client'
import Pagination from '../../components/common/Pagination'
import { showConfirmDialog } from '../../components/common/ConfirmDialog'

async function fetchMyArticles({ page = 1, status }: { page?: number; status?: string }) {
  return apiRequest({ action: 'listMyArticles', data: { page, pageSize: 20, status: status || undefined }, endpoint: 'articleCrud' })
}

async function deleteArticle(articleId: string) {
  return apiRequest({ action: 'delete', data: { articleId }, endpoint: 'articleCrud' })
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  approved: { label: '已发布', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  pending: { label: '待审核', bg: 'bg-amber-50', text: 'text-amber-600' },
  rejected: { label: '已驳回', bg: 'bg-red-50', text: 'text-red-600' },
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
      showSuccess('文章已删除')
    },
  })

  const articles = data?.data?.list || []
  const total = data?.data?.total || 0

  const handleDelete = (articleId: string) => {
    showConfirmDialog({
      title: '确认删除',
      message: '删除后无法恢复，确定要删除这篇文章吗？',
      isDanger: true,
      onConfirm: () => deleteMut.mutate(articleId),
    })
  }

  return (
    <ResponsiveContainer className="py-8 md:py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#111827]">我的文章</h1>
          <p className="text-[#6B7280] mt-1 text-sm">管理您已发布、草稿和审核中的内容</p>
        </div>
        <Link
          to="/my/articles/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4F46E5] text-white rounded-xl text-sm font-medium hover:bg-[#4338CA] transition shadow-lg shadow-indigo-500/20"
        >
          <span className="text-lg">+</span>
          <span>新建文章</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 md:p-5 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#6B7280]">状态筛选：</span>
            <div className="flex flex-wrap gap-2">
              {['', 'pending', 'approved', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => { setStatusFilter(status); setPage(1) }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-[#4F46E5] text-white'
                      : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                  }`}
                >
                  {status === '' ? '全部' : statusConfig[status]?.label || status}
                </button>
              ))}
            </div>
          </div>
          <span className="text-sm text-[#9CA3AF]">{total} 篇文章</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-[#9CA3AF]">
              <div className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
              <span>加载中...</span>
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-20 h-20 rounded-full bg-[#F3F4F6] flex items-center justify-center text-4xl mb-4">📝</div>
            <p className="text-lg font-medium text-[#111827]">还没有文章</p>
            <p className="text-sm text-[#9CA3AF] mt-1">开始创作您的第一篇文章吧</p>
            <Link to="/my/articles/new" className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition">
              发布第一篇文章 →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#E5E7EB]">
            {articles.map((article: any) => {
              const status = statusConfig[article.status] || { label: '未知', bg: 'bg-gray-50', text: 'text-gray-600' }
              return (
                <div key={article._id} className="p-4 md:p-5 hover:bg-[#FAFAFA] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                      </div>
                      <Link to={`/articles/${article._id}`} className="block group">
                        <h3 className="text-lg font-semibold text-[#111827] group-hover:text-[#4F46E5] line-clamp-2 transition-colors">
                          {article.title || '无标题文章'}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-sm text-[#9CA3AF]">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {dayjs(article.createdAt).format('YYYY-MM-DD HH:mm')}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          {article.readCount ?? 0} 阅读
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {article.commentCount ?? 0} 评论
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/articles/${article._id}`}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#4F46E5] hover:bg-[#EEF2FF] rounded-lg transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>查看</span>
                        </Link>
                        <Link
                          to={`/articles/${article._id}/edit`}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#059669] hover:bg-emerald-50 rounded-lg transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>编辑</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(article._id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-[#EF4444] hover:bg-red-50 rounded-lg transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>删除</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <Pagination page={page} pageSize={20} total={total} onPageChange={setPage} />
      </div>
    </ResponsiveContainer>
  )
}