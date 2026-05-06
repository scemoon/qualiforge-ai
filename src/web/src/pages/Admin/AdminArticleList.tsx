import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'
import ResponsiveContainer from '../../components/common/ResponsiveContainer'

async function fetchArticles({ page = 1, status }: { page?: number; status?: string }) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list', data: { page, pageSize: 20, status: status || undefined } }),
  })
  return res.json()
}

async function updateArticleStatus(articleId: string, status: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update', data: { articleId, status, publishedAt: status === 'approved' ? new Date().toISOString() : undefined } }),
  })
  return res.json()
}

const statusTag = (s: string) => {
  const map: Record<string, string> = {
    approved: 'bg-[#10B981] text-white', pending: 'bg-[#F59E0B] text-white',
    rejected: 'bg-[#EF4444] text-white',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs ${map[s] || 'bg-gray-200'}`}>{s}</span>
}

export default function AdminArticleList() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-articles', page, statusFilter],
    queryFn: () => fetchArticles({ page, status: statusFilter || undefined }),
  })

  const publishMut = useMutation({
    mutationFn: (articleId: string) => updateArticleStatus(articleId, 'approved'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-articles'] }),
  })

  const articles = data?.data?.list || []
  const total = data?.data?.total || 0

  return (
    <ResponsiveContainer className="py-6 md:py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">文章管理</h1>
        <select
          className="border border-[#E5E7EB] rounded-md px-3 py-1.5 text-sm w-full sm:w-auto"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
        >
          <option value="">全部状态</option>
          <option value="pending">待审核</option>
          <option value="approved">已发布</option>
          <option value="rejected">已驳回</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#9CA3AF]">加载中...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3AF]">暂无文章</div>
      ) : (
        <>
          {/* Desktop: Table */}
          <div className="hidden md:block bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="text-left px-4 py-3 text-[#4B5563] font-medium">标题</th>
                  <th className="text-center px-4 py-3 text-[#4B5563] font-medium">状态</th>
                  <th className="text-center px-4 py-3 text-[#4B5563] font-medium">公众号</th>
                  <th className="text-center px-4 py-3 text-[#4B5563] font-medium">发布时间</th>
                  <th className="text-center px-4 py-3 text-[#4B5563] font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article: any) => (
                  <tr key={article._id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]">
                    <td className="px-4 py-3">
                      <span className="font-medium text-[#111827] line-clamp-1">{article.title}</span>
                    </td>
                    <td className="text-center px-4 py-3">{statusTag(article.status)}</td>
                    <td className="text-center px-4 py-3">
                      {article.wxOfficialAccount?.appId ? (
                        <span className="text-xs text-[#10B981]">✅ 已配置</span>
                      ) : (
                        <span className="text-xs text-[#9CA3AF]">—</span>
                      )}
                    </td>
                    <td className="text-center px-4 py-3 text-[#9CA3AF] text-xs">
                      {article.publishedAt ? dayjs(article.publishedAt).format('YYYY-MM-DD') : '-'}
                    </td>
                    <td className="text-center px-4 py-3">
                      <Link to={`/article/${article._id}`} className="text-[#4F46E5] hover:underline mr-2">查看</Link>
                      {article.status === 'pending' && (
                        <>
                          <button onClick={() => publishMut.mutate(article._id)} className="text-[#10B981] hover:underline mr-2">发布</button>
                          <Link to="/admin/articles/review" state={{ articleId: article._id }} className="text-[#F59E0B] hover:underline">审核</Link>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: Cards */}
          <div className="md:hidden space-y-3">
            {articles.map((article: any) => (
              <div key={article._id} className="bg-white rounded-lg border border-[#E5E7EB] p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-[#111827] line-clamp-2 flex-1 mr-2">{article.title}</span>
                  {statusTag(article.status)}
                </div>
                <div className="text-xs text-[#9CA3AF] mb-2">
                  {article.wxOfficialAccount?.appId ? '✅ 公众号已配置' : '— 公众号未配置'}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6]">
                  <span className="text-xs text-[#9CA3AF]">
                    {article.publishedAt ? dayjs(article.publishedAt).format('YYYY-MM-DD') : '-'}
                  </span>
                  <div className="flex gap-2">
                    <Link to={`/article/${article._id}`} className="text-[#4F46E5] hover:underline text-sm">查看</Link>
                    {article.status === 'pending' && (
                      <>
                        <button onClick={() => publishMut.mutate(article._id)} className="text-[#10B981] hover:underline text-sm">发布</button>
                        <Link to="/admin/articles/review" state={{ articleId: article._id }} className="text-[#F59E0B] hover:underline text-sm">审核</Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {total > 20 && (
        <div className="mt-4 md:mt-6 flex flex-wrap justify-center gap-2">
          <button className="px-4 py-2 border border-[#E5E7EB] rounded-md text-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>上一页</button>
          <span className="px-4 py-2 text-sm text-[#4B5563]">{page} / {Math.ceil(total / 20)}</span>
          <button className="px-4 py-2 border border-[#E5E7EB] rounded-md text-sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}>下一页</button>
        </div>
      )}
    </ResponsiveContainer>
  )
}
