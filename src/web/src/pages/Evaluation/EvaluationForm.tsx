import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { message } from 'tdesign-react'
import ArticleEditor from '@/components/common/ArticleEditor'
import { apiRequest, showSuccess, showError } from '@/lib/api-client'

const DEFAULT_DIMENSIONS = [
  { key: '准确性', label: '准确性', desc: '输出结果的准确程度' },
  { key: '推理能力', label: '推理', desc: '逻辑推理与问题分析' },
  { key: '创造性', label: '创造性', desc: '创意与新颖程度' },
  { key: '响应速度', label: '速度', desc: '响应效率与延迟' },
  { key: '安全性', label: '安全性', desc: '合规与安全表现' },
  { key: '完整性', label: '完整性', desc: '回答的完整与全面性' },
]

const colorPresets = ['#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6']

async function fetchEvaluation(id: string) {
  return apiRequest({ action: 'get', data: { evaluationId: id }, endpoint: 'evaluationCrud' })
}

async function fetchTags() {
  return apiRequest({ action: 'listTags', endpoint: 'articleCrud' })
}

async function createTag(name: string, color: string) {
  return apiRequest({ action: 'createTag', data: { name, color }, endpoint: 'articleCrud' })
}

async function createEvaluation(data: any) {
  return apiRequest({ action: 'create', data, endpoint: 'evaluationCrud' })
}

async function updateEvaluation(data: any) {
  return apiRequest({ action: 'update', data, endpoint: 'evaluationCrud' })
}

async function uploadCover(fileContent: string, fileName: string) {
  return apiRequest({ action: 'upload', data: { fileContent, fileName }, endpoint: 'fileUpload' })
}

export default function EvaluationForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const isNew = location.pathname === '/evaluations/new'
  const isView = !!id && !location.pathname.endsWith('/edit')
  const isEdit = !!id && location.pathname.endsWith('/edit')

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [uploadingCover, setUploadingCover] = useState(false)
  const [showCreateTag, setShowCreateTag] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#6366F1')

  const [form, setForm] = useState({
    modelName: '', modelVersion: '', skillName: '', skillDescription: '', skillIcon: '', skillColor: '',
    skillTags: '' as string, overallScore: '', dimScores: {} as Record<string, string>, remark: '',
  })

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const { data: evalData, isLoading: evalLoading } = useQuery({
    queryKey: ['evaluation', id],
    queryFn: () => fetchEvaluation(id!),
    enabled: !!id && (isView || isEdit),
  })

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
  })

  const createMut = useMutation({
    mutationFn: createEvaluation,
    onSuccess: (data) => {
      if (data.code === 0) {
        showSuccess('评测已创建')
        navigate(-1)
      } else {
        showError(data.message || '创建失败')
      }
    },
  })

  const updateMut = useMutation({
    mutationFn: updateEvaluation,
    onSuccess: (data) => {
      if (data.code === 0) {
        showSuccess('评测已更新')
        setHasUnsavedChanges(false)
        navigate(-1)
      } else {
        showError(data.message || '更新失败')
      }
    },
  })

  const createTagMut = useMutation({
    mutationFn: () => createTag(newTagName.trim(), newTagColor),
    onSuccess: (data) => {
      if (data.code === 0) {
        const newTag = data.data
        if (newTag && newTag._id) {
          setSelectedTags(prev => [...prev, newTag._id])
        }
        setNewTagName('')
        setNewTagColor('#6366F1')
        setShowCreateTag(false)
        showSuccess('标签已创建')
      } else {
        showError(data.message || '创建标签失败')
      }
    },
  })

  useEffect(() => {
    if (evalData?.data) {
      const e = evalData.data
      setTitle(e.title || '')
      setContent(e.content || '')
      setCoverImage(e.coverImage || '')
      setSelectedTags(e.tags?.map((t: any) => t._id || t) || [])
      if (e.modelName !== undefined) setForm(prev => ({ ...prev, modelName: e.modelName || '' }))
      if (e.modelVersion !== undefined) setForm(prev => ({ ...prev, modelVersion: e.modelVersion || '' }))
      if (e.skillName !== undefined) setForm(prev => ({ ...prev, skillName: e.skillName || '' }))
      if (e.skillDescription !== undefined) setForm(prev => ({ ...prev, skillDescription: e.skillDescription || '' }))
      if (e.skillIcon !== undefined) setForm(prev => ({ ...prev, skillIcon: e.skillIcon || '' }))
      if (e.skillColor !== undefined) setForm(prev => ({ ...prev, skillColor: e.skillColor || '' }))
      if (e.skillTags !== undefined) setForm(prev => ({ ...prev, skillTags: e.skillTags || '' }))
      if (e.overallScore !== undefined) setForm(prev => ({ ...prev, overallScore: String(e.overallScore) || '' }))
      if (e.dimensions !== undefined) {
        const dims: Record<string, string> = {}
        Object.entries(e.dimensions).forEach(([k, v]) => { dims[k] = String(v) })
        setForm(prev => ({ ...prev, dimScores: dims }))
      }
      if (e.remark !== undefined) setForm(prev => ({ ...prev, remark: e.remark || '' }))
    }
  }, [evalData])

  const tags = tagsData?.data?.list || []

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId])
    setHasUnsavedChanges(true)
  }

  const handleDimChange = (dimKey: string, value: string) => {
    setForm(f => ({ ...f, dimScores: { ...f.dimScores, [dimKey]: value } }))
    setHasUnsavedChanges(true)
  }

  const calcAverage = () => {
    const scores = Object.values(form.dimScores).map(Number).filter(v => !isNaN(v) && v >= 0)
    if (scores.length === 0) return ''
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length).toString()
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    if (!title.trim()) { showError('标题不能为空'); return }
    if (!content.trim()) { showError('文章内容不能为空'); return }
    if (!form.modelName.trim()) { showError('模型名称必填'); return }
    if (!form.skillName.trim()) { showError('Skill 名称必填'); return }

    const dimensionEntries: [string, number][] = Object.entries(form.dimScores)
      .filter(([, v]) => v !== '')
      .map(([k, v]) => [k, Number(v)] as [string, number])

    if (dimensionEntries.length === 0 && !form.overallScore) {
      showError('请填写综合评分或至少一项维度评分')
      return
    }

    const overallScore = form.overallScore || calcAverage() || '0'
    const dimensions: Record<string, number> = {}
    dimensionEntries.forEach(([k, v]) => { dimensions[k] = v })

    const payload = {
      title: title.trim(),
      content: content.trim(),
      coverImage,
      tags: selectedTags,
      modelName: form.modelName.trim(),
      modelVersion: form.modelVersion.trim(),
      skillName: form.skillName.trim(),
      skillDescription: form.skillDescription.trim(),
      skillIcon: form.skillIcon.trim() || '📊',
      skillColor: form.skillColor.trim() || '#6366F1',
      skillTags: form.skillTags || '',
      overallScore: Number(overallScore),
      dimensions,
      remark: form.remark.trim(),
    }

    if (isEdit && id) {
      updateMut.mutate({ evaluationId: id, ...payload })
    } else {
      createMut.mutate(payload)
    }
  }

  if (evalLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F4F6F8]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#9CA3AF]">加载中...</span>
        </div>
      </div>
    )
  }

  const mode = isNew ? 'new' : isEdit ? 'edit' : 'view'

  return (
    <div className="h-screen flex flex-col bg-[#F4F6F8] overflow-hidden">
      <header className="flex-shrink-0 bg-white border-b border-[#E5E7EB] px-4 py-3">
        <div className="mx-auto h-full flex items-center justify-between">
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
              <h1 className="text-lg font-bold text-[#111827]">
                {mode === 'new' ? '新建评测' : mode === 'edit' ? '编辑评测' : '评测详情'}
              </h1>
              <p className="text-xs text-[#9CA3AF]">
                {mode === 'new' ? '填写文章内容和评测维度' : mode === 'edit' ? '修改评测内容' : '查看评测报告'}
              </p>
            </div>
          </div>
          {!isView && (
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 text-xs font-medium rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  未保存
                </span>
              )}
              <button
                onClick={handleSubmit}
                disabled={createMut.isPending || updateMut.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-xl text-sm font-semibold hover:from-[#4338CA] hover:to-[#6D28D9] transition shadow-lg shadow-indigo-500/20 disabled:opacity-60"
              >
                {(createMut.isPending || updateMut.isPending) ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>保存中...</span>
                  </>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                <span>{mode === 'new' ? '创建评测' : '保存修改'}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="h-full flex gap-4 p-4 md:p-6">
          <div className="flex-1 overflow-hidden">
            <div className="h-full bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 md:p-6 space-y-4 flex-shrink-0">
                <div>
                  <label className="block text-sm font-semibold text-[#374151] mb-2">
                    评测标题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setHasUnsavedChanges(true) }}
                    disabled={isView}
                    placeholder="输入评测标题"
                    className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
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
                      onChange={(e) => { setCoverImage(e.target.value); setHasUnsavedChanges(true) }}
                      disabled={isView}
                      placeholder="https://... 或上传图片"
                      className="flex-1 border border-[#E5E7EB] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition disabled:bg-[#F9FAFB]"
                    />
                    {!isView && (
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
                          onChange={handleCoverChange}
                          disabled={uploadingCover}
                        />
                      </label>
                    )}
                  </div>
                  {coverImage && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-[#E5E7EB] max-w-sm">
                      <img src={coverImage} alt="封面预览" className="w-full h-32 object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-[#374151]">
                      标签 <span className="text-[#9CA3AF] font-normal">(可选)</span>
                    </label>
                    {!isView && (
                      <button
                        type="button"
                        onClick={() => setShowCreateTag(!showCreateTag)}
                        className="text-xs text-[#4F46E5] hover:underline"
                      >
                        {showCreateTag ? '取消' : '+ 新建标签'}
                      </button>
                    )}
                  </div>

                  {showCreateTag && !isView && (
                    <div className="bg-[#F9FAFB] rounded-xl p-3 mb-3 border border-[#E5E7EB]">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <input
                          type="text"
                          value={newTagName}
                          onChange={e => setNewTagName(e.target.value)}
                          placeholder="标签名称"
                          className="flex-1 border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                        />
                        <div className="flex items-center gap-2">
                          {colorPresets.map(color => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setNewTagColor(color)}
                              className={`w-6 h-6 rounded-lg transition-all ${newTagColor === color ? 'ring-2 ring-offset-1 ring-[#4F46E5] scale-110' : 'hover:scale-105'}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                          <div className="w-9 h-9 rounded-lg cursor-pointer border-0"
                              style={{ backgroundColor: newTagColor }}
                              title={newTagColor}
                            />
                        </div>
                        <button
                          type="button"
                          onClick={() => { if (newTagName.trim()) createTagMut.mutate() }}
                          disabled={createTagMut.isPending || !newTagName.trim()}
                          className="px-3 py-2 bg-[#4F46E5] text-white rounded-lg text-xs font-medium hover:bg-[#4338CA] transition disabled:opacity-50"
                        >
                          {createTagMut.isPending ? '创建中...' : '添加'}
                        </button>
                      </div>
                    </div>
                  )}

                  {tags.length === 0 && !showCreateTag ? (
                    <p className="text-sm text-[#9CA3AF] py-2">暂无标签</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag: any) => (
                        <button
                          key={tag._id}
                          type="button"
                          onClick={() => !isView && toggleTag(tag._id)}
                          disabled={isView}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            selectedTags.includes(tag._id)
                              ? 'bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white shadow-lg shadow-indigo-500/20'
                              : isView ? 'bg-[#F3F4F6] text-[#9CA3AF]' : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color || '#6366F1' }}
                          />
                          <span>{tag.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-[#E5E7EB] flex flex-col flex-1 min-h-0">
                <div className="px-4 md:px-6 py-3 bg-[#FAFAFA] border-b border-[#E5E7EB] flex-shrink-0">
                  <label className="block text-sm font-semibold text-[#374151]">
                    评测内容 <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-1 overflow-hidden">
                  <ArticleEditor
                    content={content}
                    onChange={(c) => { setContent(c); setHasUnsavedChanges(true) }}
                    placeholder="开始写评测报告..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[400px] xl:w-[480px] overflow-y-auto">
            <div className="bg-white rounded-xl md:rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden lg:sticky lg:top-0">
              <div className="p-4 md:p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#4F46E5] rounded-full" />
                    Skill 信息
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Skill 名称 *</label>
                      <input
                        value={form.skillName}
                        onChange={e => { setForm({ ...form, skillName: e.target.value }); setHasUnsavedChanges(true) }}
                        disabled={isView}
                        placeholder="如 数学推理"
                        className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-[#6B7280] mb-1.5">描述</label>
                      <input
                        value={form.skillDescription}
                        onChange={e => { setForm({ ...form, skillDescription: e.target.value }); setHasUnsavedChanges(true) }}
                        disabled={isView}
                        placeholder="该 Skill 的简要描述"
                        className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#6B7280] mb-1.5">图标 (emoji)</label>
                      <input
                        value={form.skillIcon}
                        onChange={e => { setForm({ ...form, skillIcon: e.target.value }); setHasUnsavedChanges(true) }}
                        disabled={isView}
                        placeholder="📊"
                        className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#6B7280] mb-1.5">颜色</label>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-10 h-10 rounded-lg cursor-pointer border border-[#E5E7EB]"
                          style={{ backgroundColor: form.skillColor || '#6366F1' }}
                          title={form.skillColor || '#6366F1'}
                        />
                        <input
                          value={form.skillColor}
                          onChange={e => { setForm({ ...form, skillColor: e.target.value }); setHasUnsavedChanges(true) }}
                          disabled={isView}
                          placeholder="#6366F1"
                          className="flex-1 border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-medium text-[#6B7280] mb-1.5">标签</label>
                    <input
                      value={form.skillTags || ''}
                      onChange={e => { setForm({ ...form, skillTags: e.target.value }); setHasUnsavedChanges(true) }}
                      disabled={isView}
                      placeholder="输入标签，多个用逗号分隔"
                      className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#4F46E5] rounded-full" />
                    模型信息
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#6B7280] mb-1.5">模型名称 *</label>
                      <input
                        value={form.modelName}
                        onChange={e => { setForm({ ...form, modelName: e.target.value }); setHasUnsavedChanges(true) }}
                        disabled={isView}
                        placeholder="如 GPT-4o"
                        className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#6B7280] mb-1.5">版本</label>
                      <input
                        value={form.modelVersion}
                        onChange={e => { setForm({ ...form, modelVersion: e.target.value }); setHasUnsavedChanges(true) }}
                        disabled={isView}
                        placeholder="如 v1.0"
                        className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-[#111827] flex items-center gap-2">
                      <span className="w-1 h-4 bg-[#4F46E5] rounded-full" />
                      维度评分
                    </h3>
                    {!isView && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, overallScore: calcAverage() })}
                        className="text-xs text-[#4F46E5] hover:underline"
                      >
                        自动计算综合分
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {DEFAULT_DIMENSIONS.map(dim => (
                      <div key={dim.key} className="bg-[#F9FAFB] rounded-lg p-3 border border-[#E5E7EB]">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-[#4B5563]">{dim.label}</span>
                          <span className="text-[10px] text-[#9CA3AF]">{dim.desc}</span>
                        </div>
                        <input
                          value={form.dimScores[dim.key] || ''}
                          onChange={e => handleDimChange(dim.key, e.target.value)}
                          disabled={isView}
                          placeholder="0-100"
                          type="number"
                          min="0"
                          max="100"
                          className="w-full border border-[#E5E7EB] rounded-md px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent bg-white disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#4F46E5] rounded-full" />
                    综合信息
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#6B7280] mb-1.5">综合评分 (0-100)</label>
                      <input
                        value={form.overallScore}
                        onChange={e => { setForm({ ...form, overallScore: e.target.value }); setHasUnsavedChanges(true) }}
                        disabled={isView}
                        placeholder="自动或手动"
                        type="number"
                        min="0"
                        max="100"
                        className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#6B7280] mb-1.5">备注</label>
                      <input
                        value={form.remark}
                        onChange={e => { setForm({ ...form, remark: e.target.value }); setHasUnsavedChanges(true) }}
                        disabled={isView}
                        placeholder="评测条件、版本差异等补充说明"
                        className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent disabled:bg-[#F9FAFB] disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}