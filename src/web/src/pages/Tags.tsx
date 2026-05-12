import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ResponsiveContainer from '../components/common/ResponsiveContainer'

async function fetchTags() {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021.service.tcloudbase.com/api/forge/article-crud', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'listTags' }),
  })
  return res.json()
}

export default function Tags() {
  const { data, isLoading } = useQuery({ queryKey: ['tags'], queryFn: fetchTags })
  const tags = data?.data?.list || []

  return (
    <ResponsiveContainer className="py-6 md:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-6">标签</h1>

      {isLoading ? (
        <div className="text-center py-12 text-[#9CA3AF]">加载中...</div>
      ) : tags.length === 0 ? (
        <div className="text-center py-12 text-[#9CA3AF]">暂无标签</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {tags.map((tag: any) => (
            <Link
              key={tag._id}
              to={`/forge/articles/search?tag=${tag._id}`}
              className="bg-white rounded-lg border border-[#E5E7EB] p-4 hover:border-[#4F46E5] hover:shadow transition text-center"
            >
              <span className="text-lg font-medium text-[#111827] block">{tag.name}</span>
              {tag.count && <span className="text-xs text-[#9CA3AF] mt-1 block">{tag.count}</span>}
            </Link>
          ))}
        </div>
      )}
    </ResponsiveContainer>
  )
}