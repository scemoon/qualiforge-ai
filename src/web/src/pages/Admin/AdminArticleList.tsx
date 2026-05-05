import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { Link } from 'react-router-dom'

async function fetchArticles({ page = 1, status }: { page?: number; status?: string }) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'listMyArticles', data: { page, pageSize: 20, status } }),
  })
  return res.json()
}

export default function AdminArticleList() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-articles', page, statusFilter],
    queryFn: () => fetchArticles({ page, status: statusFilter || undefined }),
  })

  const articles = data?.data?.list || []
  const total = data?.data?.total || 0

  const statusTag = (s: string) => {
    const map: Record<string, string> = {
      approved: 'bg-[#10B981] text-white', pending: 'bg-[#F59E0B] text-white',
      rejected: 'bg-[#EF4444] text-white',
    }
    return <span className={`px-2 py-0.5 rounded-full text-xs ${map[s] || 'bg-gray-200'}`}>{s}</span>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">文章管理</h1>
        <div className="flex items-center gap-2">
          <select className="border border-[#E5E7EB] rounded-md px-3 py-1.5 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">全部状态</option>
            <option value="pending">待审核</option>
            <option value="approved">已发布</option>
            <option value="rejected">已驳回</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#9CA3AF]">加载中...</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3AF]">暂无文章</div>
      ) : (
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="text-left px-4 py-3 text-[#4B5563] font-medium">标题</th>
                <th className="text-center px-4 py-3 text-[#4B5563] font-medium">作者</th>
                <th className="text-center px-4 py-3 text-[#4B5563] font-medium">状态</th>
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
                  <td className="text-center px-4 py-3 text-[#4B5563]">{article.authorId || '-'}</td>
                  <td className="text-center px-4 py-3">{statusTag(article.status)}</td>
                  <td className="text-center px-4 py-3 text-[#9CA3AF] text-xs">
                    {article.publishedAt ? dayjs(article.publishedAt).format('YYYY-MM-DD') : '-'}
                  </td>
                  <td className="text-center px-4 py-3">
                    <Link to={`/article/${article._id}`} className="text-[#4F46E5] hover:underline mr-2">查看</Link>
                    {article.status === 'pending' && (
                      <Link to="/admin/articles/review" state={{ articleId: article._id }} className="text-[#F59E0B] hover:underline">审核</Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 20 && (
        <div className="mt-4 flex justify-center gap-2">
          <button className="px-4 py-2 border border-[#E5E7EB] rounded-md text-sm" onClick={() => setPage(p => Math.max(1, p - 1))}>上一页</button>
          <span className="px-4 py-2 text-sm text-[#4B5563]">第 {page} / {Math.ceil(total / 20)} 页</span>
          <button className="px-4 py-2 border border-[#E5E7EB] rounded-md text-sm" onClick={() => setPage(p => p + 1)}>下一页</button>
        </div>
      )}
    </div>
  )
}
