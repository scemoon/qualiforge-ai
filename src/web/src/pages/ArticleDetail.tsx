import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import dayjs from 'dayjs'

async function fetchArticle(id: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/article-crud', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get', data: { articleId: id } }),
  })
  return res.json()
}

export default function ArticleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery({
    queryKey: ['article', id],
    queryFn: () => fetchArticle(id!),
    enabled: !!id,
  })

  if (isLoading) return <div className="text-center py-16 text-[#9CA3AF]">加载中...</div>
  if (error || !data?.data) return <div className="text-center py-16 text-[#EF4444]">文章不存在</div>

  const article = data.data

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {article.isOfficial && (
        <span className="inline-block mb-3 px-3 py-1 bg-[#F59E0B] text-white text-xs rounded-full font-medium">
          ⭐ 官方出品
        </span>
      )}
      <h1 className="text-3xl font-bold text-[#111827] mb-4">{article.title}</h1>
      
      <div className="flex items-center gap-3 text-sm text-[#9CA3AF] mb-6 pb-6 border-b border-[#E5E7EB]">
        <span>{article.author?.nickname}</span>
        <span>·</span>
        <span>{dayjs(article.publishedAt || article.createdAt).format('YYYY-MM-DD')}</span>
        <span>·</span>
        <span>{article.readCount || 0} 阅读</span>
      </div>

      {article.coverImage && (
        <img src={article.coverImage} alt="" className="w-full rounded-lg mb-6" />
      )}

      <div className="prose max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, className, children, ...props }) {
              const inline = !className
              return !inline ? (
                <SyntaxHighlighter
                  language="javascript"
                  style={{}}
                  className="rounded-lg text-sm"
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className="bg-[#F3F4F6] px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              )
            }
          }}
        >
          {article.content || ''}
        </ReactMarkdown>
      </div>

      {article.wechatSynced && (
        <div className="mt-12 p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] text-center">
          <p className="text-sm text-[#4B5563]">✅ 本文已同步至微信公众号</p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-[#4F46E5] hover:underline cursor-pointer"
        >
          ← 返回
        </button>
      </div>
    </div>
  )
}
