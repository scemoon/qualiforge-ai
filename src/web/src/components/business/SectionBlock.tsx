import { Link } from 'react-router-dom'
import dayjs from 'dayjs'

interface SectionProps {
  section: {
    _id: string
    title: string
    type: string
    config: any
    articles?: any[]
    evaluations?: any[]
  }
  selectedTag?: string | null
  currentPage?: number
  onPageChange?: (page: number) => void
}

export default function SectionBlock({ section, selectedTag = null, currentPage = 0, onPageChange }: SectionProps) {
  const articles = section.articles || []
  const evaluations = section.evaluations || []
  const limit = section.config?.limit || 8

  // Filter articles by selected tag
  const filteredArticles = selectedTag
    ? articles.filter((a: any) => {
        const tags = a.tags || []
        return tags.includes(selectedTag)
      })
    : articles

  const totalPages = Math.ceil(filteredArticles.length / limit)
  const startIndex = currentPage * limit
  const endIndex = startIndex + limit
  const pageArticles = filteredArticles.slice(startIndex, endIndex)

  // Article list rendering
  if (section.type === 'article_list') {
    if (filteredArticles.length === 0) {
      return (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
          <p className="text-[#9CA3AF]">暂无内容</p>
        </div>
      )
    }
    return (
      <div className="space-y-3">
        {pageArticles.map((article: any, i: number) => {
          const actualIndex = startIndex + i
          return (
            <Link
              key={article._id}
              to={`/articles/${article._id}`}
              className="group block bg-white rounded-xl border border-[#E5E7EB] p-4 hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="flex gap-4">
                {article.coverImage ? (
                  <img
                    src={article.coverImage}
                    alt=""
                    className="w-24 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-24 h-20 rounded-lg bg-gradient-to-br from-[#F9FAFB] to-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📄</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-[#111827] group-hover:text-indigo-600 line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                    {actualIndex < 3 && (
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium ${
                        actualIndex === 0 ? 'bg-amber-100 text-amber-700' :
                        actualIndex === 1 ? 'bg-slate-100 text-slate-600' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        TOP {actualIndex + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-[#9CA3AF]">
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {dayjs(article.publishedAt || article.createdAt).format('YYYY-MM-DD')}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {article.authorId || '官方'}
                    </span>
                    {article.tags && article.tags.length > 0 && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {article.tags.slice(0, 2).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          )
        })}

        {/* Pagination controls */}
        {totalPages > 1 && onPageChange && (
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 0
                  ? 'bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed'
                  : 'bg-white border border-[#E5E7EB] text-[#374151] hover:bg-indigo-50 hover:border-indigo-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              上一页
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-[#4F46E5] text-white'
                      : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:bg-indigo-50'
                  }`}
                >
                  {page + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage >= totalPages - 1
                  ? 'bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed'
                  : 'bg-white border border-[#E5E7EB] text-[#374151] hover:bg-indigo-50 hover:border-indigo-300'
              }`}
            >
              下一页
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
        {totalPages > 1 && (
          <div className="text-center text-xs text-[#9CA3AF] pt-1">
            第 {currentPage + 1} / {totalPages} 页，共 {filteredArticles.length} 篇文章
          </div>
        )}
      </div>
    )
  }

  // Skill leaderboard rendering
  if (section.type === 'skill_leaderboard') {
    if (evaluations.length === 0) {
      return (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
          <p className="text-[#9CA3AF]">暂无评测数据</p>
        </div>
      )
    }
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB] text-xs font-medium text-[#9CA3AF] uppercase tracking-wide">
          <div className="col-span-1">排名</div>
          <div className="col-span-5">模型</div>
          <div className="col-span-3 text-right">综合得分</div>
          <div className="col-span-3 text-right">详情</div>
        </div>
        {/* Data rows */}
        {evaluations.slice(0, limit).map((ev: any, i: number) => (
          <div
            key={ev._id}
            className="grid grid-cols-12 gap-4 px-4 py-3.5 items-center border-b border-[#F9FAFB] last:border-0 hover:bg-[#F9FAFB] transition"
          >
            <div className="col-span-1">
              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                i === 0 ? 'bg-amber-100 text-amber-600' :
                i === 1 ? 'bg-slate-100 text-slate-500' :
                i === 2 ? 'bg-orange-100 text-orange-600' :
                'bg-[#F3F4F6] text-[#6B7280]'
              }`}>
                {i + 1}
              </span>
            </div>
            <div className="col-span-5">
              <p className="text-sm font-medium text-[#111827]">{ev.modelName}</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Skill: {ev.skillId || '代码生成'}</p>
            </div>
            <div className="col-span-3 text-right">
              <span className="inline-flex items-center justify-center px-3 py-1 bg-indigo-50 text-indigo-600 rounded text-base font-bold">
                {ev.overallScore}
              </span>
            </div>
            <div className="col-span-3 text-right">
              <Link
                to={`/articles/${ev.articleId || ev._id}`}
                className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                查看详情
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
        {/* Leaderboard footer */}
        <div className="px-4 py-3 bg-[#F9FAFB] border-t border-[#E5E7EB]">
          <Link
            to="/leaderboard"
            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            查看完整榜单
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    )
  }

  // External link
  if (section.type === 'external_link') {
    return (
      <a
        href={section.config?.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-white rounded-xl border border-[#E5E7EB] p-6 text-center hover:border-indigo-300 hover:shadow transition"
      >
        <span className="text-indigo-600 font-medium">{section.title} →</span>
      </a>
    )
  }

  return null
}