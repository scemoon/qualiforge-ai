import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import ArticleEditor from '@/components/common/ArticleEditor'

const API = 'https://cloud1-2gavd8kj8a1ce021.service.tcloudbase.com/api/forge'

async function fetchArticle(id: string) {
  const res = await fetch(`${API}/article-crud`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get', data: { articleId: id } }),
  })
  return res.json()
}

async function fetchTags() {
  const res = await fetch(`${API}/article-crud`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'listTags' }),
  })
  return res.json()
}

async function updateArticle(data: any) {
  const res = await fetch(`${API}/article-crud`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update', data }),
  })
  return res.json()
}

async function uploadCoverImage(file: File): Promise<string> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  const res = await fetch(`${API}/file-upload`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'upload', data: { fileContent: base64, fileName: file.name } }),
  })
  const data = await res.json()
  if (data.code !== 0) throw new Error(data.message || '上传失败')
  return data.data.url
}

export default function ArticleEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const titleInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

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

  const tags = tagsData?.data?.list || []

  function toggleTag(tagId: string) {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    )
  }

  async function handleCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    try {
      const url = await uploadCoverImage(file)
      setCoverImage(url)
    } catch (err: any) {
      alert(err.message || '封面上传失败')
    }
    setUploadingCover(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleSave() {
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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Part 1: Header — return, title, tags, cover, save */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 h-14 flex items-center gap-2 sm:gap-3">
          <Link
            to={`/articles/${id}`}
            className="text-[#4B5563] hover:text-[#111827] text-lg leading-none p-1"
            title="返回文章详情"
          >
            ←
          </Link>

          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="flex-1 bg-transparent text-lg sm:text-xl font-bold text-[#111827] focus:outline-none min-w-0 truncate"
            placeholder="输入文章标题"
            autoFocus
          />

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingCover}
              className="p-2 border border-[#E5E7EB] rounded-md text-[#6B7280] hover:bg-[#F9FAFB] transition disabled:opacity-50 relative"
              title="设置封面图"
            >
              {uploadingCover ? (
                <span className="text-xs animate-spin">↻</span>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
              {coverImage && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              )}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
                className="px-2.5 py-2 border border-[#E5E7EB] rounded-md text-sm text-[#6B7280] hover:bg-[#F9FAFB] transition flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {selectedTags.length > 0 && (
                  <span className="text-xs bg-[#4F46E5] text-white rounded-full w-4 h-4 flex items-center justify-center">{selectedTags.length}</span>
                )}
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
                        <span className="truncate">{tag.name}</span>
                        {selectedTags.includes(tag._id) && <span className="text-[#4F46E5] flex-shrink-0">✓</span>}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={updateMut.isPending}
              className="px-4 py-2 bg-[#4F46E5] text-white rounded-md text-sm font-medium hover:bg-[#4338CA] transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {updateMut.isPending ? (
                <>
                  <span className="animate-spin">↻</span>
                  <span>保存中</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>保存</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Part 2: Article Editor — tools + content */}
      <main className="flex-1">
        <div className="max-w-5xl mx-auto">
          <ArticleEditor
            content={content}
            onChange={setContent}
            placeholder="start ..."
          />
        </div>
      </main>
    </div>
  )
}