import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link$1 from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import CodeBlock from '@tiptap/extension-code-block'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { Markdown } from '@tiptap/markdown'
import { useAuthStore } from '@/store/authStore.ts'
import { apiRequest } from '@/lib/api-client'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import ResponsiveContainer from '@/components/common/ResponsiveContainer'

dayjs.extend(relativeTime)

async function fetchArticle(id: string) {
  return apiRequest({ action: 'get', data: { articleId: id }, endpoint: 'articleCrud' })
}

const tiptapExtensions = [
  StarterKit.configure({ codeBlock: false, heading: { levels: [1, 2, 3] } }),
  TaskList,
  TaskItem.configure({ nested: true }),
  Link$1.configure({ openOnClick: true }),
  Image,
  CodeBlock,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Highlight.configure({ multicolor: true }),
  Markdown.configure({ indentation: { style: 'space', size: 2 } }),
]

interface ArticleHeaderProps {
  article: any
  canShare: boolean
  canEdit: boolean
}

function ArticleHeader({ article, canShare, canEdit }: ArticleHeaderProps) {
  const navigate = useNavigate()

  return (
<header className="bg-white border-b border-[#E5E7EB]">
      <ResponsiveContainer>
        <div className="h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] text-[#4B5563] transition"
              title="返回"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
            </button>
            <span className="text-media font-bold text-[#6B7280] truncate max-w-[200px] sm:max-w-[500px]">{article.title}</span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-3 text-sm text-[#6B7280] pr-2">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {dayjs(article.publishedAt || article.createdAt).format('YYYY-MM-DD')}
              </span>
              <span className="text-[#D1D5DB] hidden sm:inline">·</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden xs:inline">{article.readCount || 0} 阅读</span>
              </span>
            </div>

            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm text-[#4B5563] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition"
              title="返回首页"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="hidden sm:inline">首页</span>
            </Link>
            {canShare && (
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: article.title, url: window.location.href })
                  } else {
                    navigator.clipboard.writeText(window.location.href)
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm text-[#4B5563] hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span className="hidden sm:inline">分享</span>
              </button>
            )}
            {canEdit && (
              <Link
                to={`/articles/${article._id}/edit`}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition shadow-lg shadow-indigo-500/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>编辑</span>
              </Link>
            )}
          </div>
        </div>
      </ResponsiveContainer>
    </header>
  )
}

function LoadingSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center">
          <div className="w-10 h-10 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <span className="text-sm text-[#9CA3AF]">加载中...</span>
      </div>
    </div>
  )
}

function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="h-screen flex flex-col bg-white">
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-[#4F46E5] hover:text-[#4338CA] transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            <span>返回首页</span>
          </button>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-[#F3F4F6] flex items-center justify-center text-5xl mx-auto mb-6">📄</div>
          <h2 className="text-xl font-semibold text-[#111827] mb-2">文章不存在</h2>
          <p className="text-[#6B7280] mb-6">该文章可能已被删除或不存在</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition"
          >
            <span>返回首页</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function TiptapContent({ content }: { content: string }) {
  const editor = useEditor({
    extensions: tiptapExtensions,
    content: '',
    editable: false,
    immediatelyRender: false,
  })

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content, { contentType: 'markdown' })
    }
  }, [editor, content])

  if (!editor) return null

  return (
    <div className="prose prose-slate max-w-none
      prose-headings:text-[#111827] prose-headings:font-bold
      prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-8
      prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-6
      prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4
      prose-p:text-[#374151] prose-p:leading-relaxed prose-p:mb-4
      prose-a:text-[#4F46E5] prose-a:no-underline hover:prose-a:underline
      prose-code:bg-[#F3F4F6] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
      prose-pre:bg-[#1e1b4b] prose-pre:text-white prose-pre:rounded-xl prose-pre:p-5 prose-pre:font-mono
      prose-blockquote:border-l-4 prose-blockquote:border-[#4F46E5] prose-blockquote:bg-[#F8FAFC] prose-blockquote:rounded-r-lg prose-blockquote:py-2 prose-blockquote:px-4
      prose-img:rounded-xl prose-img:shadow-lg
      prose-ul:text-[#374151] prose-li:text-[#374151]
      prose-hr:border-[#E5E7EB] prose-hr:my-8">
      <EditorContent editor={editor} />
    </div>
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
  const canEdit = !!(isAuthenticated && article && ((user?.role ?? '') === 'admin' || user?._id === article.authorId))
  const canShare = !!(article && article.wxOfficialAccount?.appId)

  if (isLoading) return <LoadingSkeleton />
  if (error || !article) return <NotFound />

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <ArticleHeader
        article={article}
        canShare={canShare}
        canEdit={canEdit}
      />

<main className="flex-1 overflow-y-auto">
        <ResponsiveContainer className="py-6 md:py-10">
          <article className="max-w-3xl mx-auto">
            {/* Cover Image */}
            {article.coverImage && (
              <div className="mb-6 md:mb-8 rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl">
                <img src={article.coverImage} alt="" className="w-full" />
              </div>
            )}

            {/* Article Content - Tiptap Preview */}
            <div className="mb-6 md:mb-8">
              <TiptapContent content={article.content} />
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 py-6 border-t border-[#E5E7EB]">
                {article.tags.map((tag: any, i: number) => (
                  <Link
                    key={i}
                    to={`/articles/search?tag=${encodeURIComponent(tag.name || tag)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F1F5F9] text-[#64748B] text-sm rounded-lg font-medium hover:bg-[#E2E8F0] hover:text-[#4F46E5] transition"
                  >
                    <span className="text-[#94A3B8]">#</span>
                    <span>{tag.name || tag}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Wechat Sync Badge */}
            {article.wechatSynced && (
              <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl mb-6 md:mb-8">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium text-emerald-700">本文已同步至微信公众号</span>
              </div>
            )}

            {/* Author Box */}
            {article.author && (
              <div className="bg-[#F8FAFC] rounded-xl md:rounded-2xl p-4 md:p-5 mb-6 md:mb-8">
                <Link to={`/experts/${article.author._id}`} className="flex items-center gap-3 md:gap-4 group">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white text-lg font-bold shadow-lg">
                    {article.author.nickname?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#374151] group-hover:text-[#4F46E5] transition">
                      {article.author.nickname}
                    </p>
                    <p className="text-xs text-[#9CA3B8] mt-0.5">
                      {article.author.role === 'admin' ? '管理员' : '专家'}
                    </p>
                    {article.author.bio && (
                      <p className="text-sm text-[#6B7280] mt-2 line-clamp-2">{article.author.bio}</p>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-[#94A3B8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </article>
        </ResponsiveContainer>
      </main>
    </div>
  )
}