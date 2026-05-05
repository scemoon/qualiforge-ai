import { useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'

async function search(keyword: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/search', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'search', data: { keyword, pageSize: 20 } }),
  })
  return res.json()
}

export default function Search() {
  const [searchParams] = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '')
  const [query, setQuery] = useState(searchParams.get('keyword') || '')

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => search(query),
    enabled: query.length > 0,
  })

  const articles = data?.data?.articles || []
  const skills = data?.data?.skills || []
  const evaluations = data?.data?.evaluations || []

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setQuery(keyword)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#111827] mb-6">搜索</h1>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="搜索文章、Skill、评测..."
            className="flex-1 border border-[#E5E7EB] rounded-md px-4 py-2.5 text-sm"
          />
          <button type="submit" className="px-5 py-2 bg-[#4F46E5] text-white rounded-md text-sm hover:bg-[#4338CA] transition">
            搜索
          </button>
        </div>
      </form>

      {!query && (
        <div className="text-center py-16 text-[#9CA3AF]">
          <p className="text-lg">🔍 输入关键词开始搜索</p>
          <p className="text-sm mt-2">支持文章标题、Skill 名称、模型名称</p>
        </div>
      )}

      {isLoading && query && (
        <div className="text-center py-12 text-[#9CA3AF]">搜索中...</div>
      )}

      {data && !isLoading && query && (
        <>
          {articles.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-[#111827] mb-3">📝 文章 ({articles.length})</h2>
              <div className="space-y-3">
                {articles.map((a: any) => (
                  <Link key={a._id} to={`/article/${a._id}`} className="block bg-white rounded-lg border border-[#E5E7EB] p-4 hover:shadow-sm transition">
                    <h3 className="font-medium text-[#111827] mb-1">{a.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                      <span>{a.authorId}</span>
                      <span>·</span>
                      <span>{dayjs(a.publishedAt || a.createdAt).format('YYYY-MM-DD')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-[#111827] mb-3">🎯 Skill ({skills.length})</h2>
              <div className="grid grid-cols-2 gap-3">
                {skills.map((s: any) => (
                  <div key={s._id} className="bg-white rounded-lg border border-[#E5E7EB] p-4 flex items-center gap-3">
                    <span className="text-2xl">{s.icon || '📊'}</span>
                    <div>
                      <p className="font-medium text-[#111827]">{s.name}</p>
                      <p className="text-xs text-[#9CA3AF]">{s.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {evaluations.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-[#111827] mb-3">📊 评测 ({evaluations.length})</h2>
              <div className="space-y-3">
                {evaluations.map((ev: any) => (
                  <div key={ev._id} className="bg-white rounded-lg border border-[#E5E7EB] p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#111827]">{ev.modelName}</p>
                      <p className="text-xs text-[#9CA3AF]">{ev.modelVersion} · {ev.evaluationDate}</p>
                    </div>
                    <span className="text-xl font-bold text-[#4F46E5]">{ev.overallScore}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {articles.length === 0 && skills.length === 0 && evaluations.length === 0 && (
            <div className="text-center py-16 text-[#9CA3AF]">
              <p>未找到「{query}」相关结果</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
