import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import ResponsiveContainer from '../../components/common/ResponsiveContainer'

const API_BASE = 'https://cloud1-2gavd8kj8a1ce021.service.tcloudbase.com/api/forge'

async function searchAll(keyword: string) {
  const [articlesRes, skillsRes] = await Promise.all([
    fetch(`${API_BASE}/article-crud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'search', data: { keyword } }),
    }),
    fetch(`${API_BASE}/skill-crud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'search', data: { keyword } }),
    }),
  ])
  const articlesData = await articlesRes.json()
  const skillsData = await skillsRes.json()
  return {
    articles: articlesData?.data?.list || [],
    skills: skillsData?.data?.list || [],
  }
}

type Tab = 'articles' | 'skills'

export default function Search() {
  const [keyword, setKeyword] = useState('')
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<Tab>('articles')

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchAll(query),
    enabled: !!query,
  })

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setQuery(keyword)
  }

  return (
    <ResponsiveContainer className="py-6 md:py-8">
      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-6 md:mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索文章、Skill..."
            className="flex-1 border border-[#E5E7EB] rounded-md px-4 py-2.5 text-sm"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#4F46E5] text-white rounded-md text-sm hover:bg-[#4338CA] transition"
          >
            搜索
          </button>
        </div>
      </form>

      {/* Tabs */}
      {query && (
        <div className="mb-4 flex gap-4 border-b border-[#E5E7EB]">
          <button
            className={`pb-2 text-sm font-medium border-b-2 ${tab === 'articles' ? 'border-[#4F46E5] text-[#4F46E5]' : 'border-transparent text-[#6B7280]'}`}
            onClick={() => setTab('articles')}
          >
            文章 {data?.articles.length ? `(${data.articles.length})` : ''}
          </button>
          <button
            className={`pb-2 text-sm font-medium border-b-2 ${tab === 'skills' ? 'border-[#4F46E5] text-[#4F46E5]' : 'border-transparent text-[#6B7280]'}`}
            onClick={() => setTab('skills')}
          >
            Skill {data?.skills.length ? `(${data.skills.length})` : ''}
          </button>
        </div>
      )}

      {/* Results */}
      {!query ? (
        <div className="text-center py-16 text-[#9CA3AF]">
          <p>输入关键词搜索文章或 Skill</p>
        </div>
      ) : isLoading ? (
        <div className="text-center py-12 text-[#9CA3AF]">搜索中...</div>
      ) : tab === 'articles' ? (
        data?.articles.length === 0 ? (
          <div className="text-center py-12 text-[#9CA3AF]">未找到相关文章</div>
        ) : (
          <div className="space-y-3">
            {data?.articles.map((article: any) => (
              <Link key={article._id} to={`/forge/article/${article._id}`} className="block bg-white rounded-lg border border-[#E5E7EB] p-4 hover:shadow-md transition">
                <h3 className="font-medium text-[#111827] mb-2 line-clamp-2">{article.title}</h3>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#9CA3AF]">
                  <span>{article.author?.nickname}</span>
                  <span>·</span>
                  <span>{dayjs(article.publishedAt || article.createdAt).format('YYYY-MM-DD')}</span>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        data?.skills.length === 0 ? (
          <div className="text-center py-12 text-[#9CA3AF]">未找到相关 Skill</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.skills.map((skill: any) => (
              <div key={skill._id} className="bg-white rounded-lg border border-[#E5E7EB] p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{skill.icon}</span>
                  <h3 className="font-medium text-[#111827]">{skill.name}</h3>
                </div>
                <p className="text-sm text-[#6B7280] line-clamp-2">{skill.description}</p>
              </div>
            ))}
          </div>
        )
      )}
    </ResponsiveContainer>
  )
}