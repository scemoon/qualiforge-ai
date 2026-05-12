import { Link } from 'react-router-dom'
import ResponsiveContainer from '../components/common/ResponsiveContainer'

export default function NotFound() {
  return (
    <ResponsiveContainer className="py-16 md:py-24">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-bold text-[#111827] mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-[#4B5563] mb-4">页面未找到</h2>
        <p className="text-lg text-[#6B7280] mb-8 max-w-md mx-auto">
          抱歉，您访问的页面不存在或已被移动。
        </p>
        <div className="space-x-4">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-[#4F46E5] text-white rounded-md hover:bg-[#4338CA] transition"
          >
            返回首页
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-block px-6 py-3 border border-[#E5E7EB] text-[#4B5563] rounded-md hover:bg-[#F9FAFB] transition"
          >
            返回上一页
          </button>
        </div>
      </div>
    </ResponsiveContainer>
  )
}