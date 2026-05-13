import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { marked } from 'marked'
import dayjs from 'dayjs'
import { useAuthStore } from '@/store/authStore.ts'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link$1 from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import CodeBlock from '@tiptap/extension-code-block'
import { useEditor, EditorContent } from '@tiptap/react'

const API = 'https://cloud1-2gavd8kj8a1ce021.service.tcloudbase.com/api/forge'

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

function ArticleContent({ content }: { content: string }) {
  let parsed: any = ''
  if (content) {
    try {
      parsed = JSON.parse(content)
    } catch {
      parsed = marked.parse(content) as string
    }
  }

  const editor = useEditor({
    extensions: tiptapExtensions,
    content: parsed,
    editable: false,
  })

  return <EditorContent editor={editor} className="prose max-w-none text-sm md:text-base" />
}

function Header({
  title,
  canShare,
  canEdit,
  editTo,
}: {
  title: string
  canShare?: boolean
  canEdit?: boolean
  editTo?: string
}) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB]/50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="text-[#4B5563] hover:text-[#111827] text-lg leading-none p-1 flex-shrink-0"
            title="返回"
          >
            ←
          </button>
          {title && (
            <span className="text-sm text-[#6B7280] truncate hidden sm:block">{title}</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {canShare && (
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title, url: window.location.href })
                } else {
                  navigator.clipboard.writeText(window.location.href)
                }
              }}
              className="px-3 py-1.5 border border-[#E5E7EB] rounded-md text-sm text-[#4B5563] hover:bg-[#F9FAFB] transition flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span className="hidden sm:inline">分享</span>
            </button>
          )}
          {canEdit && editTo && (
            <Link
              to={editTo}
              className="px-3 py-1.5 bg-[#4F46E5] text-white rounded-md text-sm font-medium hover:bg-[#4338CA] transition flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>编辑</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default function ArticleDetail() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuthStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ['article', id],
    queryFn: () => fetchArticle(id!),
    enabled: !!id,
  })

  const article = data?.data
  const canEdit = !!(isAuthenticated && article && (user?.role === 'admin' || user?._id === article.authorId))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
        <Header title="" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-[#9CA3AF]">
            <span className="w-4 h-4 border-2 border-[#9CA3AF] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">加载中...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
        <Header title="" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg text-[#EF4444]">文章不存在</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Header
        title={article.title}
        canShare={!!article.wxOfficialAccount?.appId}
        canEdit={canEdit}
        editTo={`/articles/${article._id}/edit`}
      />

      {/* Cover Image Banner */}
      {article.coverImage && (
        <div className="relative w-full h-56 sm:h-72 md:h-80 overflow-hidden bg-[#1a1a2e]">
          <img
            src={article.coverImage}
            alt=""
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Article Header */}
          <div className={article.coverImage ? '-mt-16 relative z-10 bg-white rounded-t-2xl shadow-sm px-6 sm:px-8 pt-8 pb-4' : 'pt-8 pb-4'}>
            {article.isOfficial && (
              <span className="inline-block mb-4 px-3 py-1 bg-[#F59E0B]/10 text-[#D97706] text-xs font-semibold rounded-full">
                ⭐ 官方出品
              </span>
            )}

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] leading-tight mb-4">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#6B7280] pb-4 border-b border-[#E5E7EB]">
              {article.author?.nickname && (
                <>
                  <span className="font-medium text-[#4B5563]">{article.author.nickname}</span>
                  <span className="text-[#D1D5DB]">·</span>
                </>
              )}
              <span>{dayjs(article.publishedAt || article.createdAt).format('YYYY-MM-DD')}</span>
              <span className="text-[#D1D5DB]">·</span>
              <span>{article.readCount || 0} 阅读</span>
            </div>
          </div>

          {/* Article Content */}
          <div className="bg-white rounded-2xl px-6 sm:px-8 py-6 shadow-sm mb-6">
            <ArticleContent content={article.content} />
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags.map((tag: any, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-[#F3F4F6] text-[#6B7280] text-xs rounded-full font-medium"
                >
                  #{tag.name || tag}
                </span>
              ))}
            </div>
          )}

          {/* WeChat Sync Notice */}
          {article.wechatSynced && (
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-3 text-center mb-6">
              <span className="text-sm text-[#16A34A] font-medium">✅ 本文已同步至微信公众号</span>
            </div>
          )}
        </div>
      </main>
      <footer className="bg-[#F9FAFB] py-8 mt-12"></footer>
    </div>
  )
}