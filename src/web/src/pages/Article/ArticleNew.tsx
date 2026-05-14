import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { message } from 'tdesign-react'
import ArticleEditor from '@/components/common/ArticleEditor'
import { apiRequest } from '@/lib/api-client'

async function fetchTags() {
  return apiRequest({ action: 'listTags', endpoint: 'articleCrud' })
}

export default function ArticleNew() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [uploadingCover, setUploadingCover] = useState(false)

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
  })

  const createMut = useMutation({
    mutationFn: (data: any) => apiRequest({ action: 'create', data, endpoint: 'articleCrud' }),
    onSuccess: (data: any) => {
      if (data.code === 0) {
        message.success('文章已提交，等待管理员审核')
        navigate('/my')
      } else {
        message.error(data.message || '提交失败')
      }
    },
    onError: () => message.error('网络错误，请重试'),
  })

  const tags = tagsData?.data?.list || []

  function toggleTag(tagId: string) {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    )
  }

  function handleSubmit() {
    if (!title.trim()) {
      message.warning('标题不能为空')
      return
    }
    if (!content.trim()) {
      message.warning('内容不能为空')
      return
    }
    createMut.mutate({ title: title.trim(), content: content.trim(), coverImage, tags: selectedTags })
  }

  return (
    <div className="h-screen flex flex-col bg-[#F4F6F8] overflow-hidden">
      <header className="flex-shrink-0 bg-white border-b border-[#E5E7EB] px-4 py-3">
        <div className="max-w-5xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#F3F4F6] text-[#4B5563] transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-[#111827]">发布文章</h1>
              <p className="text-xs text-[#9CA3AF]">提交后将由管理员审核</p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={createMut.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-xl text-sm font-semibold hover:from-[#4338CA] hover:to-[#6D28D9] transition shadow-lg shadow-indigo-500/20 disabled:opacity-60"
          >
            {createMut.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>提交中...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>提交审核</span>
              </>
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-5xl mx-auto p-4 md:p-6">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2">
                  文章标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入文章标题"
                  className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2">
                  封面图 URL <span className="text-[#9CA3AF] font-normal">(可选)</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://... 或上传图片"
                    className="flex-1 border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                  />
                  <label className="flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#4B5563] hover:bg-[#F9FAFB] cursor-pointer transition">
                    {uploadingCover ? (
                      <div className="w-4 h-4 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    <span>上传</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setUploadingCover(true)
                        const reader = new FileReader()
                        reader.onload = async () => {
                          const base64 = (reader.result as string).split(',')[1]
                          try {
                            const data = await apiRequest({ action: 'upload', data: { fileContent: base64, fileName: file.name }, endpoint: 'fileUpload' })
                            setCoverImage(data.data.url)
                            message.success('封面上传成功')
                          } catch (err: any) {
                            message.error(err.message || '封面上传失败')
                          }
                          setUploadingCover(false)
                        }
                        reader.readAsDataURL(file)
                      }}
                    />
                  </label>
                </div>
                {coverImage && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-[#E5E7EB] max-w-sm">
                    <img
                      src={coverImage}
                      alt="封面预览"
                      className="w-full h-32 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-3">
                  标签 <span className="text-[#9CA3AF] font-normal">(可选)</span>
                </label>
                {tags.length === 0 ? (
                  <p className="text-sm text-[#9CA3AF] py-2">暂无标签</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: any) => (
                      <button
                        key={tag._id}
                        type="button"
                        onClick={() => toggleTag(tag._id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          selectedTags.includes(tag._id)
                            ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                        }`}
                      >
                        {selectedTags.includes(tag._id) && (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color || '#6366F1' }}
                        />
                        <span>{tag.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedTags.length > 0 && (
                  <p className="text-xs text-[#9CA3AF] mt-2">已选择 {selectedTags.length} 个标签</p>
                )}
              </div>
            </div>

            <div className="border-t border-[#E5E7EB] flex flex-col h-[calc(100vh-320px)] min-h-[300px]">
              <div className="px-4 md:px-6 py-3 bg-[#FAFAFA] border-b border-[#E5E7EB] flex-shrink-0">
                <label className="block text-sm font-semibold text-[#374151]">
                  文章内容 <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="flex-1 overflow-hidden rounded-b-xl">
                <ArticleEditor
                  content={content}
                  onChange={setContent}
                  placeholder="开始写文章..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}