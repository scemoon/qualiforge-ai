import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import ArticleEditor from '@/components/common/ArticleEditor'

async function fetchArticle(id: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021.service.tcloudbase.com/api/forge/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get', data: { articleId: id } }),
  })
  return res.json()
}

async function fetchTags() {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021.service.tcloudbase.com/api/forge/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'listTags' }),
  })
  return res.json()
}

async function updateArticle(data: any) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021.service.tcloudbase.com/api/forge/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update', data }),
  })
  return res.json()
}

export default function ArticleEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const titleInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false)

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
    onError: () => alert('网络错误，请重试'),
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

  useEffect(() => {
    if (!loadingArticle && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [loadingArticle])

  const tags = tagsData?.data?.list || []

  function toggleTag(tagId: string) {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { alert('标题不能为空'); return }
    if (!content.trim()) { alert('内容不能为空'); return }
    updateMut.mutate({ articleId: id, title: title.trim(), content: content.trim(), coverImage, tags: selectedTags })
  }

  if (loadingArticle) return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-center">
      <div className="animate-spin text-2xl text-[#4F46E5] mb-2">↻</div>
      <p className="text-sm text-[#9CA3AF]">加载中...</p>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* 页面标题 + 标题输入 + 标签选择 */}
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <Link
          to={`/articles/${id}`}
          className="text-[#4B5563] hover:text-[#111827] text-lg sm:text-xl p-1"
          title="返回文章详情"
        >
          ←
        </Link>
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="flex-1 border-b-2 border-[#E5E7EB] focus:border-[#4F46E5] bg-transparent text-xl sm:text-2xl font-bold text-[#111827] focus:outline-none transition px-1"
          placeholder="输入文章标题"
          required
        />
        <div className="relative">
          <button
            type="button"
            onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
            className="px-3 py-1.5 border border-[#E5E7EB] rounded-md text-sm text-[#4B5563] hover:bg-[#F9FAFB] transition flex items-center gap-1"
          >
            标签 {selectedTags.length > 0 && `(${selectedTags.length})`}
            <span className="text-xs">▼</span>
          </button>
          {tagDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {tags.length === 0 ? (
                <div className="px-3 py-2 text-sm text-[#9CA3AF]">暂无标签</div>
              ) : (
                tags.map((tag: any) => (
                  <button
                    key={tag._id}
                    type="button"
                    onClick={() => toggleTag(tag._id)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[#F9FAFB] flex items-center justify-between"
                  >
                    <span>{tag.name}</span>
                    {selectedTags.includes(tag._id) && <span className="text-[#4F46E5]">✓</span>}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        <Link
          to={`/articles/${id}`}
          className="text-xs sm:text-sm text-[#4F46E5] hover:underline whitespace-nowrap"
        >
          返回详情
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* 封面图 */}
        <div>
          <label className="block text-sm font-medium text-[#4B5563] mb-1.5">封面图 URL <span className="text-[#9CA3AF] font-normal">(可选)</span></label>
          <input
            type="text"
            value={coverImage}
            onChange={e => setCoverImage(e.target.value)}
            className="w-full border border-[#E5E7EB] rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
            placeholder="https://..."
          />
          {coverImage && (
            <div className="mt-2 rounded-lg overflow-hidden border border-[#E5E7EB] h-32 sm:h-40">
              <img src={coverImage} alt="封面预览" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
        </div>

        {/* 富文本编辑器 */}
        <div>
          <label className="block text-sm font-medium text-[#4B5563] mb-1.5">文章内容 <span className="text-red-500">*</span></label>
          <div className="sm:mx-0">
            <ArticleEditor
              content={content}
              onChange={setContent}
              placeholder="支持 Markdown 语法..."
            />
          </div>
        </div>

        {/* 操作区域 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={updateMut.isPending}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {updateMut.isPending ? (
              <>
                <span className="animate-spin">↻</span>
                <span>保存中...</span>
              </>
            ) : (
              <>
                <span>✓</span>
                <span>保存修改</span>
              </>
            )}
          </button>
          <Link
            to={`/articles/${id}`}
            className="w-full sm:w-auto px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm text-[#4B5563] hover:bg-[#F9FAFB] transition text-center"
          >
            取消
          </Link>
        </div>
      </form>
    </div>
  )
}
