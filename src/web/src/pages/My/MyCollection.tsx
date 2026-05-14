import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import ResponsiveContainer from '../../components/common/ResponsiveContainer'
import { apiRequest } from '../../lib/api-client'

async function fetchCollections() {
  return apiRequest({ action: 'myCollections', data: { page: 1, pageSize: 50 }, endpoint: 'articleCrud' })
}

export default function MyCollection() {
  const { data, isLoading } = useQuery({ queryKey: ['my-collections'], queryFn: fetchCollections })
  const articles = data?.data?.list || []

  return (
    <ResponsiveContainer className="py-8 md:py-10">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#111827]">我的收藏</h1>
        <p className="text-[#6B7280] mt-1 text-sm">您收藏的文章将显示在这里</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-[#9CA3AF]">
            <div className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
            <span>加载中...</span>
          </div>
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-24 h-24 rounded-full bg-rose-50 flex items-center justify-center text-5xl mb-5">❤️</div>
          <p className="text-lg font-medium text-[#111827]">还没有收藏</p>
          <p className="text-sm text-[#9CA3AF] mt-1">浏览文章时点击收藏按钮即可收藏</p>
          <Link to="/articles/search" className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#4F46E5] text-white rounded-xl text-sm font-medium hover:bg-[#4338CA] transition shadow-lg shadow-indigo-500/20">
            去浏览文章 →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {articles.map((article: any) => (
            <Link
              key={article._id}
              to={`/articles/${article._id}`}
              className="group bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden hover:border-rose-300 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-200"
            >
              <div className="h-2 bg-gradient-to-r from-rose-500 to-pink-500" />
              <div className="p-5">
                <h3 className="font-semibold text-[#111827] group-hover:text-rose-600 line-clamp-2 transition-colors">
                  {article.title}
                </h3>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-3 text-xs text-[#9CA3AF]">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {article.authorName || article.authorId || '匿名'}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {dayjs(article.publishedAt || article.createdAt).format('YYYY-MM-DD')}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {article.readCount || 0} 阅读
                  </span>
                </div>
                <div className="flex items-center justify-end mt-4">
                  <span className="inline-flex items-center gap-1 text-xs text-rose-500 font-medium group-hover:gap-1.5 transition-all">
                    查看全文
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </ResponsiveContainer>
  )
}