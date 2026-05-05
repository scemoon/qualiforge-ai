import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

async function fetchTags() {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'listTags' }),
  })
  return res.json()
}

async function createArticle(data: any) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create', data }),
  })
  return res.json()
}

export default function MyArticleNew() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [preview, setPreview] = useState(false)

  const { data: tagsData } = useQuery({ queryKey: ['tags'], queryFn: fetchTags })
  const createMut = useMutation({
    mutationFn: createArticle,
    onSuccess: (data) => {
      if (data.code === 0) {
        alert('文章已提交，等待管理员审核！')
        navigate('/my')
      } else {
        alert(data.message || '提交失败')
      }
    },
  })

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
    createMut.mutate({ title: title.trim(), content: content.trim(), coverImage, tags: selectedTags })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111827] mb-6">发布文章</h1>

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
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-[#4B5563]">文章内容（Markdown）*</label>
            <button type="button" onClick={() => setPreview(p => !p)} className="text-xs text-[#4F46E5] hover:underline">
              {preview ? '编辑' : '预览'}
            </button>
          </div>
          {preview ? (
            <div className="border border-[#E5E7EB] rounded-md p-4 min-h-[300px] prose max-w-none text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || '*无内容*'}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-md px-4 py-3 text-sm font-mono"
              rows={15}
              placeholder="支持 Markdown 格式..."
              required
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={createMut.isPending} className="px-6 py-2.5 bg-[#4F46E5] text-white rounded-md text-sm font-medium hover:bg-[#4338CA] transition disabled:opacity-50">
            {createMut.isPending ? '提交中...' : '提交审核'}
          </button>
          <span className="text-xs text-[#9CA3AF]">提交后将由管理员审核通过后发布</span>
        </div>
      </form>
    </div>
  )
}
