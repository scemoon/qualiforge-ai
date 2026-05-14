import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { message } from 'tdesign-react'
import ArticleEditor from '@/components/common/ArticleEditor'
import { apiRequest } from '@/lib/api-client'

async function fetchArticle(id: string) {
  return apiRequest({ action: 'get', data: { articleId: id }, endpoint: 'articleCrud' })
}

async function fetchTags() {
  return apiRequest({ action: 'listTags', endpoint: 'articleCrud' })
}

async function updateArticle(data: any) {
  return apiRequest({ action: 'update', data, endpoint: 'articleCrud' })
}

async function uploadCover(fileContent: string, fileName: string) {
  return apiRequest({ action: 'upload', data: { fileContent, fileName }, endpoint: 'fileUpload' })
}

const TAG_COLORS = [
  'from-rose-500 to-pink-500',
  'from-violet-500 to-purple-500',
  'from-indigo-500 to-blue-500',
  'from-cyan-500 to-teal-500',
  'from-emerald-500 to-green-500',
  'from-amber-500 to-orange-500',
]

export default function ArticleEdit() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagPopupVisible, setTagPopupVisible] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

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
        message.success('文章已更新')
        setHasUnsavedChanges(false)
        navigate('/')
      } else {
        message.error(data.message || '更新失败')
      }
    },
    onError: () => message.error('网络错误，请重试'),
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
    setHasUnsavedChanges(true)
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1]
      try {
        const data = await uploadCover(base64, file.name)
        setCoverImage(data.data.url)
        setHasUnsavedChanges(true)
        message.success('封面上传成功')
      } catch (err: any) {
        message.error(err.message || '封面上传失败')
      }
      setUploadingCover(false)
    }
    reader.onerror = () => {
      message.error('文件读取失败')
      setUploadingCover(false)
    }
    reader.readAsDataURL(file)
  }

  function handleSave() {
    if (!title.trim()) {
      message.warning('标题不能为空')
      return
    }
    if (!content.trim()) {
      message.warning('内容不能为空')
      return
    }
    updateMut.mutate({ articleId: id, title: title.trim(), content: content.trim(), coverImage, tags: selectedTags })
  }

  if (loadingArticle) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#9CA3AF]">加载中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            to={`/articles/${id}`}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] text-[#4B5563] transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
          </Link>

          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setHasUnsavedChanges(true) }}
            placeholder="输入文章标题"
            className="flex-1 text-lg font-semibold bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-[#9CA3AF]"
          />

          {hasUnsavedChanges && (
            <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 text-xs font-medium rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              未保存
            </span>
          )}

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#4B5563] hover:bg-[#F9FAFB] cursor-pointer transition">
              {uploadingCover ? (
                <div className="w-4 h-4 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
              <span>封面</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
                disabled={uploadingCover}
              />
            </label>

            <div className="relative">
              <button
                onClick={() => setTagPopupVisible(!tagPopupVisible)}
                className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm font-medium transition ${
                  selectedTags.length > 0
                    ? 'border-[#4F46E5] text-[#4F46E5] bg-[#EEF2FF]'
                    : 'border-[#E5E7EB] text-[#4B5563] hover:bg-[#F9FAFB]'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>标签{selectedTags.length > 0 ? ` (${selectedTags.length})` : ''}</span>
              </button>

              {tagPopupVisible && (
                <>
                  <div className="fixed inset-0 z-[100]" onClick={() => setTagPopupVisible(false)} />
                  <div className="absolute right-0 top-full mt-2 w-[280px] bg-white rounded-xl shadow-xl border border-[#E5E7EB] overflow-hidden z-[110]">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
                      <span className="text-sm font-semibold text-[#111827]">选择标签</span>
                      <button
                        onClick={() => setTagPopupVisible(false)}
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#F3F4F6] text-[#9CA3AF]"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                      {tags.length === 0 ? (
                        <div className="py-6 text-center text-sm text-[#9CA3AF]">暂无标签</div>
                      ) : (
                        tags.map((tag: any, index: number) => {
                          const colorIndex = index % TAG_COLORS.length
                          const isSelected = selectedTags.includes(tag._id)
                          return (
                            <div
                              key={tag._id}
                              onClick={() => toggleTag(tag._id)}
                              className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-[#EEF2FF]'
                                  : 'hover:bg-[#F9FAFB]'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-4 h-4 rounded-full bg-gradient-to-br ${TAG_COLORS[colorIndex]}`}
                                />
                                <span className={`text-sm font-medium ${isSelected ? 'text-[#4F46E5]' : 'text-[#111827]'}`}>
                                  {tag.name}
                                </span>
                              </div>
                              {isSelected && (
                                <svg className="w-4 h-4 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={updateMut.isPending || !hasUnsavedChanges}
              className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-lg text-sm font-semibold hover:from-[#4338CA] hover:to-[#6D28D9] transition shadow-lg shadow-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {updateMut.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>保存中...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>保存</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-5xl mx-auto px-4 py-6 flex flex-col">
          {/* Cover Preview */}
          {coverImage && (
            <div className="mb-4 rounded-xl overflow-hidden border border-[#E5E7EB] shadow-lg flex-shrink-0">
              <img src={coverImage} alt="封面预览" className="w-full h-40 object-cover" />
            </div>
          )}

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
              {selectedTags.map((tagId) => {
                const tag = tags.find((t: any) => t._id === tagId)
                if (!tag) return null
                const colorIndex = tags.indexOf(tag) % TAG_COLORS.length
                return (
                  <span
                    key={tagId}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${TAG_COLORS[colorIndex]} text-white`}
                  >
                    {tag.name}
                    <button
                      onClick={() => toggleTag(tagId)}
                      className="hover:bg-white/20 rounded-full p-0.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )
              })}
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 rounded-2xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
            <div className="h-full">
              <ArticleEditor
                content={content}
                onChange={(c) => { setContent(c); setHasUnsavedChanges(true) }}
                placeholder="开始写文章..."
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}