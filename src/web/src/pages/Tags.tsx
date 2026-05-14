import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ResponsiveContainer from '../components/common/ResponsiveContainer'
import { apiRequest } from '../lib/api-client'

async function fetchTags() {
  return apiRequest({ action: 'listTags', endpoint: 'articleCrud' })
}

const tagColors = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-indigo-500 to-purple-600',
  'from-cyan-500 to-blue-600',
  'from-teal-500 to-emerald-600',
]

export default function Tags() {
  const { data, isLoading } = useQuery({ queryKey: ['tags'], queryFn: fetchTags })
  const tags = data?.data?.list || []

  return (
    <ResponsiveContainer className="py-8 md:py-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#111827]">探索标签</h1>
        <p className="text-[#6B7280] mt-1">按技能标签浏览相关专家和内容</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-[#9CA3AF]">
            <div className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
            <span>加载中...</span>
          </div>
        </div>
      ) : tags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-24 h-24 rounded-full bg-[#F3F4F6] flex items-center justify-center text-5xl mb-5">🏷️</div>
          <p className="text-lg font-medium text-[#111827]">暂无标签</p>
          <p className="text-sm text-[#9CA3AF] mt-1">管理员尚未创建任何标签</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {tags.map((tag: any, index: number) => (
            <Link
              key={tag._id}
              to={`/articles/search?tag=${encodeURIComponent(tag.name || tag.title || tag._id)}`}
              className="group relative bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:border-transparent hover:shadow-xl transition-all duration-300"
            >
              <div className={`h-1.5 bg-gradient-to-r ${tagColors[index % tagColors.length]}`} />
              <div className="p-4 md:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tagColors[index % tagColors.length]} flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                    {(tag.name || tag.title || '?')[0]?.toUpperCase()}
                  </div>
                  {tag.count !== undefined && (
                    <span className="text-xs font-medium text-[#9CA3AF] bg-[#F3F4F6] px-2 py-1 rounded-full">
                      {tag.count}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-[#111827] group-hover:text-[#4F46E5] transition-colors truncate">
                  {tag.name || tag.title || '未知标签'}
                </h3>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-[#9CA3AF]">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>浏览内容</span>
                  <svg className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 p-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white">
        <h2 className="text-lg font-bold">找不到想要的标签？</h2>
        <p className="text-white/70 mt-1 text-sm">尝试使用搜索功能，或者浏览所有专家的内容</p>
        <div className="flex flex-wrap gap-3 mt-4">
          <Link
            to="/articles/search"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition"
          >
            搜索文章 →
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#4F46E5] hover:bg-indigo-50 rounded-lg text-sm font-medium transition"
          >
            浏览首页 →
          </Link>
        </div>
      </div>
    </ResponsiveContainer>
  )
}