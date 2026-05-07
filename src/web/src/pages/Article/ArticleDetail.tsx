import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import dayjs from 'dayjs'
import { useAuthStore } from '../../store/authStore'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link$1 from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import CodeBlock from '@tiptap/extension-code-block'

const API = 'https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com'

async function fetchArticle(id: string) {
  const res = await fetch(`${API}/article-crud`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get', data: { articleId: id } }),
  })
  return res.json()
}

const tiptapExtensions = [
  StarterKit.configure({ codeBlock: false, heading: { levels: [1, 2, 3] } }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Link$1.configure({ openOnClick: true }),
  Image,
  CodeBlock,
]

function renderContent(content: string): string {
  if (!content) return ''
  // Try TipTap JSON first
  try {
    const json = JSON.parse(content)
    return DOMPurify.sanitize(generateHTML(json, tiptapExtensions))
  } catch {
    // Fallback: content is Markdown
    return DOMPurify.sanitize(marked.parse(content) as string)
  }
}

export default function ArticleDetail() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuthStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ['article', id],
    queryFn: () => fetchArticle(id!),
    enabled: !!id,
  })

  if (isLoading) return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <DetailHeader title="" onShare={undefined} onEdit={undefined} />
      <div className="flex-1 flex items-center justify-center text-[#9CA3AF]">加载中...</div>
    </div>
  )

  if (error || !data?.data) return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <DetailHeader title="" onShare={undefined} onEdit={undefined} />
      <div className="flex-1 flex items-center justify-center text-[#EF4444]">文章不存在</div>
    </div>
  )

  const article = data.data
  const canEdit = isAuthenticated && (user?.role === 'admin' || user?._id === article.authorId)
  const htmlContent = renderContent(article.content)

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <DetailHeader
        title={article.title}
        onShare={article.wxOfficialAccount?.appId ? () => {
          if (navigator.share) {
            navigator.share({ title: article.title, url: window.location.href })
          } else {
            navigator.clipboard.writeText(window.location.href)
          }
        } : undefined}
        onEdit={canEdit ? () => { window.location.href = `/my/edit?id=${article._id}` } : undefined}
      />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
          {article.isOfficial && (
            <span className="inline-block mb-3 px-3 py-1 bg-[#F59E0B] text-white text-xs rounded-full font-medium">
              ⭐ 官方出品
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-4">{article.title}</h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#9CA3AF] mb-6 pb-6 border-b border-[#E5E7EB]">
            <span>{article.author?.nickname}</span>
            <span>·</span>
            <span>{dayjs(article.publishedAt || article.createdAt).format('YYYY-MM-DD')}</span>
            <span>·</span>
            <span>{article.readCount || 0} 阅读</span>
          </div>

          {article.coverImage && (
            <img src={article.coverImage} alt="" className="w-full rounded-lg mb-6" />
          )}

          <div className="prose max-w-none text-sm md:text-base">
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>

          {article.wechatSynced && (
            <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
              <p className="text-sm text-[#10B981] text-center">✅ 本文已同步至微信公众号</p>
            </div>
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-[#9CA3AF] border-t border-[#E5E7EB] bg-white">
        © 2026 QualiForge AI — AI Coding 质量保障社区
      </footer>
    </div>
  )
}

function DetailHeader({
  title,
  onShare,
  onEdit,
}: {
  title: string
  onShare?: () => void
  onEdit?: () => void
}) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Link to="/" className="text-[#4B5563] hover:text-[#111827] text-xl leading-none flex-shrink-0">←</Link>
          <span className="text-sm text-[#111827] truncate">{title}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onShare && (
            <button onClick={onShare} className="px-3 py-1.5 border border-[#E5E7EB] rounded-md text-sm text-[#4B5563] hover:bg-[#F9FAFB] transition">分享</button>
          )}
          {onEdit && (
            <button onClick={onEdit} className="px-3 py-1.5 bg-[#4F46E5] text-white rounded-md text-sm hover:bg-[#4338CA] transition">编辑</button>
          )}
        </div>
      </div>
    </header>
  )
}