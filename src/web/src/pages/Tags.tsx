import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

async function fetchTags() {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/article-crud', {
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#111827] mb-6">标签导航</h1>
      {isLoading ? (
        <div className="text-center py-12 text-[#9CA3AF]">加载中...</div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map((tag: any) => (
            <Link
              key={tag._id}
              to={`/article/search?tag=${tag._id}`}
              className="px-4 py-2 bg-white border border-[#E5E7EB] rounded-full text-sm text-[#4B5563] hover:border-[#4F46E5] hover:text-[#4F46E5] transition"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
