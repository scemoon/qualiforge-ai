import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Pagination from '@/components/common/Pagination'

dayjs.extend(relativeTime)

interface BaseItem {
  _id: string
  title?: string
  coverImage?: string
  createdAt?: string
  publishedAt?: string
  authorId?: string
  author?: any
  tags?: any[]
  readCount?: number
}

interface Article extends BaseItem {}

interface Evaluation {
  _id: string
  modelName?: string
  modelVersion?: string
  skillName?: string
  skillIcon?: string
  skillColor?: string
  overallScore?: number
  createdAt?: string
  skillTags?: string[]
}

interface SectionConfig {
  filters?: {
    tag?: string
    time?: string
    popularity?: string
  }
  limit?: number
  pageSize?: number
  articleIds?: string[]
  skillId?: string
  url?: string
  description?: string
}

interface Section {
  _id: string
  title: string
  type: string
  config: SectionConfig
  articles?: Article[]
  evaluations?: Evaluation[]
  enabled?: boolean
  visibility?: string
  order?: number
}

interface SectionBlockProps {
  section: Section
  skillTags?: any[]
  onTagChange?: (tag: string | null) => void
}

const TAG_COLORS = [
  'from-rose-500 to-pink-500',
  'from-violet-500 to-purple-500',
  'from-indigo-500 to-blue-500',
  'from-cyan-500 to-teal-500',
  'from-emerald-500 to-green-500',
  'from-amber-500 to-orange-500',
  'from-red-500 to-rose-500',
]

function RankingBadge({ rank }: { rank: number }) {
  const config: Record<number, { bg: string; text: string; label: string }> = {
    0: { bg: 'bg-amber-100', text: 'text-amber-700', label: '1' },
    1: { bg: 'bg-slate-100', text: 'text-slate-600', label: '2' },
    2: { bg: 'bg-orange-100', text: 'text-orange-700', label: '3' },
  }
  const style = config[rank] || { bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]', label: String(rank + 1) }
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  )
}

function ArticleCard({ article, showRanking = false, rank = 0 }: { article: Article; showRanking?: boolean; rank?: number }) {
  const date = dayjs(article.publishedAt || article.createdAt).format('YYYY-MM-DD')
  const authorName = article.author?.nickname || article.authorId || '官方'
  const tags = article.tags || []

  return (
    <Link
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
            {showRanking && rank < 3 && (
              <span className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700">
                TOP {rank + 1}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-[#9CA3Af]">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {date}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white text-[8px] font-bold">
                {(authorName || 'U')[0]?.toUpperCase()}
              </div>
              {authorName}
            </span>
            {tags.length > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {Array.isArray(tags) ? tags.slice(0, 2).join(', ') : tags}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

function EvaluationCard({ evaluation, rank = 0 }: { evaluation: Evaluation; rank?: number }) {
  const score = parseFloat(String(evaluation.overallScore)) || 0
  const scoreColor = score >= 80 ? '#059669' : score >= 60 ? '#D97706' : '#DC2626'
  const scoreBg = score >= 80 ? '#ECFDF5' : score >= 60 ? '#FFFBEB' : '#FEF2F2'
  const skillColor = evaluation.skillColor || '#6366F1'
  const skillIcon = evaluation.skillIcon || '📊'

  return (
    <div className="grid grid-cols-12 gap-4 px-4 py-3.5 items-center border-b border-[#F9FAFB] last:border-0 hover:bg-[#F9FAFB] transition">
      <div className="col-span-1">
        <RankingBadge rank={rank} />
      </div>
      <div className="col-span-5">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
            style={{ backgroundColor: skillColor + '18' }}
          >
            {skillIcon}
          </div>
          <div>
            <p className="text-sm font-medium text-[#111827]">{evaluation.modelName || '未知模型'}</p>
            <p className="text-xs text-[#9CA3Af]">{evaluation.skillName || '未分类'}</p>
          </div>
        </div>
      </div>
      <div className="col-span-3 text-right">
        <span
          className="inline-flex items-center justify-center px-3 py-1 rounded text-sm font-bold"
          style={{ backgroundColor: scoreBg, color: scoreColor }}
        >
          {score}
        </span>
      </div>
      <div className="col-span-3 text-right">
        <Link
          to={`/evaluations/${evaluation._id}`}
          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          查看详情
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

function EmptyState({ message = '暂无内容' }: { message?: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
      <p className="text-[#9CA3Af]">{message}</p>
    </div>
  )
}

function TagFilter({
  tags,
  activeTag,
  onChange
}: {
  tags: any[]
  activeTag: string | null
  onChange: (tag: string | null) => void
}) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          activeTag === null
            ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-lg shadow-indigo-500/20'
            : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
        }`}
      >
        全部
      </button>
      {tags.map((tag: any, index: number) => {
        const tagName = tag.name || tag.title || tag._id || ''
        const colorIndex = index % TAG_COLORS.length
        return (
          <button
            key={tag._id}
            onClick={() => onChange(tagName)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeTag === tagName
                ? `bg-gradient-to-r ${TAG_COLORS[colorIndex]} text-white shadow-lg`
                : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
            }`}
          >
            {tagName}
          </button>
        )
      })}
    </div>
  )
}

function SectionHeader({ title, icon }: { title: string; icon?: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {icon && <span className="text-xl">{icon}</span>}
      <h2 className="text-lg font-bold text-[#111827]">{title}</h2>
    </div>
  )
}

export default function SectionBlock({ section, skillTags = [], onTagChange }: SectionBlockProps) {
  const [localTag, setLocalTag] = useState<string | null>(null)

  const pageSize = section.config?.pageSize || section.config?.limit || 10

  const articles = section.articles || []
  const evaluations = section.evaluations || []

  const filteredArticles = useMemo(() => {
    if (!localTag) return articles
    return articles.filter((a: Article) => {
      const tags = a.tags || []
      return tags.includes(localTag) || tags.some((t: any) => (typeof t === 'object' ? t.name === localTag : t === localTag))
    })
  }, [articles, localTag])

  const filteredEvaluations = useMemo(() => {
    if (!localTag) return evaluations
    return evaluations.filter((e: Evaluation) => {
      const tags = e.skillTags || []
      return tags.includes(localTag) || tags.some((t: any) => (typeof t === 'object' ? t.name === localTag : t === localTag))
    })
  }, [evaluations, localTag])

  const sortedEvaluations = useMemo(() => {
    return [...filteredEvaluations].sort((a, b) => (parseFloat(String(b.overallScore)) || 0) - (parseFloat(String(a.overallScore)) || 0))
  }, [filteredEvaluations])

  const handleTagChange = (tag: string | null) => {
    setLocalTag(tag)
    onTagChange?.(tag)
  }

  const renderArticleList = () => {
    if (filteredArticles.length === 0) {
      return <EmptyState message="暂无文章" />
    }

    return (
      <div className="space-y-3">
        {filteredArticles.slice(0, pageSize).map((article, i) => (
          <ArticleCard key={article._id} article={article} showRanking={i < 3} rank={i} />
        ))}
        {filteredArticles.length > pageSize && (
          <Pagination
            page={1}
            pageSize={pageSize}
            total={filteredArticles.length}
            onPageChange={() => {}}
          />
        )}
      </div>
    )
  }

  const renderEvaluationList = () => {
    if (sortedEvaluations.length === 0) {
      return <EmptyState message="暂无评测数据" />
    }

    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[#F9FAFB] border-b border-[#E5E7EB] text-xs font-medium text-[#9CA3Af] uppercase tracking-wide">
          <div className="col-span-1">排名</div>
          <div className="col-span-5">模型</div>
          <div className="col-span-3 text-right">综合得分</div>
          <div className="col-span-3 text-right">详情</div>
        </div>
        {sortedEvaluations.slice(0, pageSize).map((evaluation, i) => (
          <EvaluationCard key={evaluation._id} evaluation={evaluation} rank={i} />
        ))}
      </div>
    )
  }

  const renderExternalLink = () => {
    const url = section.config?.url
    const description = section.config?.description
    if (!url) return null
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-white rounded-xl border border-[#E5E7EB] p-6 text-center hover:border-indigo-300 hover:shadow transition"
      >
        <span className="text-indigo-600 font-medium">{section.title || '访问链接'} →</span>
        {description && <p className="text-xs text-[#9CA3Af] mt-1">{description}</p>}
      </a>
    )
  }

  const renderContent = () => {
    switch (section.type) {
      case 'article':
      case 'article_list':
      case 'tag_feed':
        return renderArticleList()
      case 'skill_evaluation':
      case 'skill_leaderboard':
        return renderEvaluationList()
      case 'external_link':
        return renderExternalLink()
      default:
        return <EmptyState message="未知板块类型" />
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader title={section.title} />
      {(['article', 'article_list', 'tag_feed', 'skill_evaluation', 'skill_leaderboard'].includes(section.type)) && skillTags.length > 0 && (
        <TagFilter tags={skillTags} activeTag={localTag} onChange={handleTagChange} />
      )}
      {renderContent()}
    </div>
  )
}