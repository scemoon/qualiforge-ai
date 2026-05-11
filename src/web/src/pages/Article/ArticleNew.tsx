import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import ArticleEditor from '@/components/common/ArticleEditor'

async function fetchTags() {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/forge-article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'listTags' }),
  })
  return res.json()
}

async function createArticle(data: any) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/forge-article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create', data }),
  })
  return res.json()
}

export default function ArticleNew() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagError, setTagError] = useState('')

  const { data: tagsData } = useQuery({ queryKey: ['tags'], queryFn: fetchTags })
  const createMut = useMutation({
    mutationFn: createArticle,
    onSuccess: (data) => {
      if (data.code === 0) {
        alert('文章已提交，等待管理员审核！')
        navigate('/forge/my')
      } else {
        alert(data.message || '提交失败')
      }
    },
    onError: () => alert('网络错误，请重试'),
  })

  const tags = tagsData?.data?.list || []

  function toggleTag(tagId: string) {
    setTagError('')
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { alert('标题不能为空'); return }
    if (!content.trim()) { alert('内容不能为空'); return }
    createMut.mutate({ title: title.trim(), content: content.trim(), coverImage, tags: selectedTags })
  }

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">发布文章</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* 标题 */}
        <div>
          <label className="block text-sm font-medium text-[#4B5563] mb-1.5">文章标题 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border border-[#E5E7EB] rounded-lg px-3 sm:px-4 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
            placeholder="输入文章标题"
            required
          />
        </div>

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

        {/* 标签 */}
        <div>
          <label className="block text-sm font-medium text-[#4B5563] mb-1.5">标签 <span className="text-[#9CA3AF] font-normal">(可选)</span></label>
          {tagError && <p className="text-xs text-red-500 mb-1">{tagError}</p>}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {tags.map((tag: any) => (
              <button
                key={tag._id}
                type="button"
                onClick={() => toggleTag(tag._id)}
                className={`
                  px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm border transition
                  ${selectedTags.includes(tag._id)
                    ? 'bg-[#4F46E5] text-white border-[#4F46E5]'
                    : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#4F46E5]'
                  }
                `}
              >
                {tag.name}
              </button>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <p className="text-xs text-[#9CA3AF] mt-1.5">已选 {selectedTags.length} 个标签</p>
          )}
        </div>

        {/* 富文本编辑器 */}
        <div>
          <label className="block text-sm font-medium text-[#4B5563] mb-1.5">
            文章内容 <span className="text-red-500">*</span>
          </label>
          <div className="sm:mx-0">
            <ArticleEditor
              content={content}
              onChange={setContent}
              placeholder="支持 Markdown 语法，可直接粘贴图片链接..."
            />
          </div>
        </div>

        {/* 提交区域 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={createMut.isPending}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {createMut.isPending ? (
              <>
                <span className="animate-spin">↻</span>
                <span>提交中...</span>
              </>
            ) : (
              <>
                <span>✈</span>
                <span>提交审核</span>
              </>
            )}
          </button>
          <p className="text-xs text-[#9CA3AF] sm:hidden">提交后将由管理员审核通过后发布</p>
          <p className="text-xs text-[#9CA3AF] hidden sm:block">提交后将由管理员审核通过后发布</p>
        </div>
      </form>
    </div>
  )
}
