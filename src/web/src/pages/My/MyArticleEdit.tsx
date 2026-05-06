import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import ArticleEditor from '@/components/common/ArticleEditor'

async function fetchArticle(id: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get', data: { articleId: id } }),
  })
  return res.json()
}

async function fetchTags() {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'listTags' }),
  })
  return res.json()
}

async function updateArticle(data: any) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update', data }),
  })
  return res.json()
}

export default function MyArticleEdit() {
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id') || ''
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const { data: articleData, isLoading: loadingArticle } = useQuery({
    queryKey: ['article', id],
    queryFn: () => fetchArticle(id!),
    enabled: !!id,
  })

  const { data: tagsData } = useQuery({ queryKey: ['tags'], queryFn: fetchTags })

  const updateMut = useMutation({
    mutationFn: updateArticle,
    onSuccess: (data) => {
      if (data.code === 0) {
        alert('文章已更新')
        navigate('/my')
      } else {
        alert(data.message || '更新失败')
      }
    },
  })

  useEffect(() => {
    if (articleData?.data) {
      const a = articleData.data
      setTitle(a.title || '')
      setContent(a.content || '')
      setCoverImage(a.coverImage || '')
      setSelectedTags(a.tags?.map((t: any) => t._id || t) || [])
    }
  }, [articleData])

  const tags = tagsData?.data?.list || []

  function toggleTag(tagId: string) {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      alert('标题和内容不能为空')
      return
    }
    updateMut.mutate({ articleId: id, title: title.trim(), content: content.trim(), coverImage, tags: selectedTags })
  }

  if (loadingArticle) return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-center text-[#9CA3AF]">加载中...</div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/article/${id}`} className="text-[#4B5563] hover:text-[#111827] text-lg">←</Link>
          <h1 className="text-xl font-bold text-[#111827]">编辑文章</h1>
        </div>
        <Link to={`/article/${id}`} className="text-sm text-[#4F46E5] hover:underline">返回详情</Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-[#E5E7EB] p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#4B5563] mb-1">文章标题 *</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-[#E5E7EB] rounded-md px-4 py-2.5 text-sm" placeholder="输入文章标题" required />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[#4B5563] mb-1">封面图 URL（可选）</label>
          <input type="text" value={coverImage} onChange={e => setCoverImage(e.target.value)} className="w-full border border-[#E5E7EB] rounded-md px-4 py-2 text-sm" placeholder="https://..." />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-[#4B5563] mb-1">标签（可选）</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: any) => (
              <button key={tag._id} type="button"
                onClick={() => toggleTag(tag._id)}
                className={`px-3 py-1 rounded-full text-sm border transition ${selectedTags.includes(tag._id) ? 'bg-[#4F46E5] text-white border-[#4F46E5]' : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#4F46E5]'}`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-[#4B5563] block mb-1">文章内容 *</label>
          <ArticleEditor
            content={content}
            onChange={setContent}
            placeholder="支持富文本格式..."
          />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={updateMut.isPending} className="px-6 py-2.5 bg-[#4F46E5] text-white rounded-md text-sm font-medium hover:bg-[#4338CA] transition disabled:opacity-50">
            {updateMut.isPending ? '保存中...' : '保存修改'}
          </button>
          <Link to={`/article/${id}`} className="px-4 py-2.5 border border-[#E5E7EB] rounded-md text-sm text-[#4B5563] hover:bg-[#F9FAFB] transition">
            取消
          </Link>
        </div>
      </form>
    </div>
  )
}
