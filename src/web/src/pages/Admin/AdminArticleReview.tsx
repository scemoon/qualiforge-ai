import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import dayjs from 'dayjs'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ResponsiveContainer from '../../components/common/ResponsiveContainer'

async function fetchPendingArticles() {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list', data: { status: 'pending', page: 1, pageSize: 20 } }),
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

export default function AdminArticleReview() {
  const location = useLocation()
  const [selectedId, setSelectedId] = useState<string>(location.state?.articleId || '')
  const [rejectReason, setRejectReason] = useState('')

  const { data: listData, refetch: refetchList } = useQuery({
    queryKey: ['pending-articles'],
    queryFn: fetchPendingArticles,
  })

  const { data: articleData, isLoading: loadingArticle } = useQuery({
    queryKey: ['article-review', selectedId],
    queryFn: () => fetchArticle(selectedId),
    enabled: !!selectedId,
  })

  const approveMut = useMutation({
    mutationFn: approveArticle,
    onSuccess: () => {
      refetchList()
      setSelectedId('')
    },
  })

  const rejectMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => rejectArticle(id, reason),
    onSuccess: () => {
      refetchList()
      setSelectedId('')
    },
  })

  const articles = listData?.data?.list || []

  return (
    <ResponsiveContainer className="py-6 md:py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-4 md:mb-6">文章审核</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Article list - desktop: sidebar, mobile: top list */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden lg:order-1 order-2">
          <div className="px-4 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB]">
            <span className="text-sm font-medium text-[#4B5563]">待审核文章 ({articles.length})</span>
          </div>
          {articles.length === 0 ? (
            <div className="p-6 md:p-8 text-center text-[#9CA3AF] text-sm">暂无待审核文章 ✅</div>
          ) : (
            <div className="divide-y divide-[#F3F4F6] max-h-[400px] lg:max-h-[600px] overflow-y-auto">
              {articles.map((a: any) => (
                <div
                  key={a._id}
                  className={`px-4 py-3 cursor-pointer hover:bg-[#F9FAFB] transition ${selectedId === a._id ? 'bg-[#EEF2FF]' : ''}`}
                  onClick={() => setSelectedId(a._id)}
                >
                  <p className="text-sm font-medium text-[#111827] line-clamp-2">{a.title}</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">{dayjs(a.createdAt).format('YYYY-MM-DD HH:mm')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Article preview + actions */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#E5E7EB] p-4 md:p-6 lg:order-2 order-1">
          {!selectedId ? (
            <div className="text-center py-12 md:py-16 text-[#9CA3AF]">← 请选择左侧文章进行审核</div>
          ) : loadingArticle ? (
            <div className="text-center py-12 md:py-16 text-[#9CA3AF]">加载中...</div>
          ) : (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-[#111827]">{articleData?.data?.title}</h2>
                  <p className="text-xs md:text-sm text-[#9CA3AF] mt-1">
                    {dayjs(articleData?.data?.createdAt).format('YYYY-MM-DD HH:mm')}
                  </p>
                </div>
                <span className="px-3 py-1 bg-[#F59E0B] text-white text-xs rounded-full font-medium">待审核</span>
              </div>

              <div className="prose max-w-none text-sm text-[#4B5563] mb-4 md:mb-6 max-h-48 md:max-h-64 overflow-y-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {(articleData?.data?.content || '').slice(0, 500)}
                </ReactMarkdown>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 pt-4 border-t border-[#E5E7EB]">
                <button
                  onClick={() => approveMut.mutate(selectedId)}
                  disabled={approveMut.isPending}
                  className="px-5 py-2 bg-[#10B981] text-white rounded-md text-sm hover:bg-[#059669] transition disabled:opacity-50"
                >
                  {approveMut.isPending ? '处理中...' : '✅ 通过'}
                </button>
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
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
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ResponsiveContainer>
  )
}