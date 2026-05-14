import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest, showSuccess } from '@/lib/api-client'
import { showConfirmDialog } from '@/components/common/ConfirmDialog'

async function fetchSections() {
  return apiRequest({ action: 'list', endpoint: 'sectionCrud' })
}

async function createSection(title: string, type: string, config: any) {
  return apiRequest({ action: 'create', data: { title, type, config, order: 99, visibility: 'public', enabled: true }, endpoint: 'sectionCrud' })
}

async function updateSection(sectionId: string, data: any) {
  return apiRequest({ action: 'update', data: { sectionId, ...data }, endpoint: 'sectionCrud' })
}

async function deleteSection(sectionId: string) {
  return apiRequest({ action: 'delete', data: { sectionId }, endpoint: 'sectionCrud' })
}

async function reorderSections(orders: { sectionId: string; order: number }[]) {
  return apiRequest({ action: 'reorder', data: { orders }, endpoint: 'sectionCrud' })
}

const typeConfig: Record<string, { label: string; icon: string; color: string; desc: string }> = {
  article: { label: '文章', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'from-blue-500 to-cyan-600', desc: '展示文章列表，支持按标签/时间/热度筛选' },
  skill_evaluation: { label: 'Skill 评测', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'from-amber-500 to-orange-600', desc: '展示 Skill 评测结果，支持按标签/时间/热度筛选' },
}

const typeOptions = [
  { value: 'article', label: '文章' },
  { value: 'skill_evaluation', label: 'Skill 评测' },
]

const filterOptions = [
  { value: 'tag', label: '按标签' },
  { value: 'time', label: '按时间' },
  { value: 'popularity', label: '按热度' },
]

export default function AdminSection() {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [type, setType] = useState('article')
  const [isCreating, setIsCreating] = useState(false)
  const [editingSection, setEditingSection] = useState<any>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropTarget, setDropTarget] = useState<number | null>(null)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [filterTag, setFilterTag] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-sections'],
    queryFn: fetchSections,
    retry: 1,
  })

  const createMut = useMutation({
    mutationFn: () => {
      const filters = selectedFilters.reduce((acc, f) => {
        if (f === 'tag') acc.tag = filterTag
        else if (f === 'time') acc.time = 'desc'
        else if (f === 'popularity') acc.popularity = 'desc'
        return acc
      }, {} as Record<string, any>)
      const config = { filters, limit: 8 }
      return createSection(title.trim(), type, config)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sections'] })
      setTitle('')
      setType('article')
      setIsCreating(false)
      setSelectedFilters([])
      setFilterTag('')
      showSuccess('板块已创建')
    },
  })

  const updateMut = useMutation({
    mutationFn: (data: { sectionId: string; title?: string; type?: string; config?: any; enabled?: boolean }) =>
      updateSection(data.sectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sections'] })
      setEditingSection(null)
      showSuccess('板块已更新')
    },
  })

  const toggleMut = useMutation({
    mutationFn: ({ sectionId, enabled }: { sectionId: string; enabled: boolean }) =>
      updateSection(sectionId, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sections'] })
      showSuccess('板块状态已更新')
    },
  })

  const deleteMut = useMutation({
    mutationFn: deleteSection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sections'] })
      showSuccess('板块已删除')
    },
  })

  const reorderMut = useMutation({
    mutationFn: reorderSections,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sections'] })
      showSuccess('排序已保存')
    },
  })

  const responseData = data?.data
  const rawSections: any[] = Array.isArray(responseData)
    ? responseData
    : responseData?.list || responseData?.sections || []
  const sections = rawSections.map((s: any) => ({
    _id: s._id || s.sectionId,
    title: s.title || '',
    type: s.type || 'article_list',
    order: s.order ?? 99,
    enabled: s.enabled ?? true,
    config: s.config,
    visibility: s.visibility,
    createdAt: s.createdAt,
  }))

  const handleDelete = (section: any) => {
    showConfirmDialog({
      title: '确认删除',
      message: `确定删除板块「${section.title || section._id}」？删除后不可恢复。`,
      isDanger: true,
      onConfirm: () => deleteMut.mutate(section._id),
    })
  }

  const handleToggle = (section: any) => {
    toggleMut.mutate({ sectionId: section._id, enabled: !section.enabled })
  }

  const handleEdit = (section: any) => {
    setTitle(section.title || '')
    setType(section.type || 'article')
    const filters = section.config?.filters || {}
    const loadedFilters: string[] = []
    if (filters.tag) { loadedFilters.push('tag'); setFilterTag(filters.tag) }
    if (filters.time) loadedFilters.push('time')
    if (filters.popularity) loadedFilters.push('popularity')
    setSelectedFilters(loadedFilters)
    setEditingSection(section)
    setIsCreating(true)
  }

  const handleEditCancel = () => {
    setEditingSection(null)
    setTitle('')
    setType('article')
    setIsCreating(false)
    setSelectedFilters([])
    setFilterTag('')
  }

  const handleEditSave = () => {
    if (!title.trim()) return
    const filters = selectedFilters.reduce((acc, f) => {
      if (f === 'tag') acc.tag = filterTag
      else if (f === 'time') acc.time = 'desc'
      else if (f === 'popularity') acc.popularity = 'desc'
      return acc
    }, {} as Record<string, any>)
    const config = { filters, limit: editingSection?.config?.limit || 8 }

    updateMut.mutate({
      sectionId: editingSection._id,
      title: title.trim(),
      type,
      config,
    })
  }

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index)
    setDropTarget(index)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex !== null && dragIndex !== index) {
      setDropTarget(index)
    }
  }, [dragIndex])

  const handleDragLeave = useCallback(() => {
    setDropTarget(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null)
      setDropTarget(null)
      return
    }

    const reordered = [...sections]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(index, 0, moved)

    const orders = reordered.map((s, i) => ({ sectionId: s._id, order: i }))
    reorderMut.mutate(orders)

    setDragIndex(null)
    setDropTarget(null)
  }, [dragIndex, sections, reorderMut])

  const handleDragEnd = useCallback(() => {
    setDragIndex(null)
    setDropTarget(null)
  }, [])

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      <div className="px-6 py-5 border-b border-[#E5E7EB] bg-white shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#111827]">板块管理</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">控制首页板块的显示、排序与内容</p>
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition shadow-lg shadow-indigo-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCreating ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'} />
            </svg>
            <span>{isCreating ? '取消' : '新建板块'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Create/Edit form */}
        {isCreating && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 mb-6 shadow-lg">
            <h3 className="text-base font-semibold text-[#111827] mb-4">{editingSection ? '编辑板块' : '创建新板块'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">板块名称 *</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="如「最新文章」"
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">类型</label>
                <select
                  value={type}
                  onChange={e => { setType(e.target.value); setSelectedFilters([]); setFilterTag('') }}
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                >
                  {typeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <p className="text-[10px] text-[#9CA3AF] mt-1">{typeConfig[type]?.desc}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-[#6B7280] mb-2">筛选条件（可多选）</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {filterOptions.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      if (selectedFilters.includes(opt.value)) {
                        setSelectedFilters(selectedFilters.filter(f => f !== opt.value))
                        if (opt.value === 'tag') setFilterTag('')
                      } else {
                        setSelectedFilters([...selectedFilters, opt.value])
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      selectedFilters.includes(opt.value)
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {opt.label}
                    {selectedFilters.includes(opt.value) && (
                      <span className="ml-1">✓</span>
                    )}
                  </button>
                ))}
              </div>
              {selectedFilters.includes('tag') && (
                <input
                  value={filterTag}
                  onChange={e => setFilterTag(e.target.value)}
                  placeholder="输入标签名称"
                  className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                />
              )}
            </div>
            <div className="flex gap-3">
              {editingSection ? (
                <>
                  <button
                    onClick={handleEditSave}
                    disabled={updateMut.isPending || !title.trim()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{updateMut.isPending ? '保存中...' : '保存修改'}</span>
                  </button>
                  <button
                    onClick={handleEditCancel}
                    className="px-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-[#F9FAFB] transition"
                  >
                    取消
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { if (title.trim()) createMut.mutate() }}
                  disabled={createMut.isPending || !title.trim()}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{createMut.isPending ? '创建中...' : '确认创建'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Section list */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#F1F5F9] bg-[#FAFAFA]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#111827]">当前板块（共 {sections.length} 个）</h2>
              {sections.length > 0 && (
                <span className="text-xs text-[#9CA3AF]">拖拽可调整排序</span>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex items-center gap-3 text-[#9CA3AF]">
                <div className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
                <span>加载中...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-48">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-sm text-[#EF4444] font-medium">加载失败</p>
              <p className="text-xs text-[#9CA3AF] mt-1">请检查登录状态或刷新重试</p>
            </div>
          ) : sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-sm text-[#6B7280]">暂无板块</p>
              <p className="text-xs text-[#9CA3AF] mt-1">点击"新建板块"创建首页内容区块</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F1F5F9]">
              {sections.map((s: any, index: number) => {
                const config = typeConfig[s.type] || typeConfig.article
                const isDragOver = dropTarget === index && dragIndex !== index
                return (
                  <div
                    key={s._id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-4 px-4 py-3 hover:bg-[#FAFAFA] transition-colors group cursor-grab active:cursor-grabbing ${isDragOver ? 'bg-indigo-50 border-l-4 border-[#4F46E5]' : ''} ${dragIndex === index ? 'opacity-50' : ''}`}
                  >
                    {/* Drag handle */}
                    <div className="shrink-0 text-[#D1D5DB] group-hover:text-[#9CA3AF] transition-colors cursor-grab">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zm-6 5h2v2H8v-2zm6 0h2v2h-2v-2z" />
                      </svg>
                    </div>

                    {/* Order number */}
                    <div className="shrink-0 w-7 h-7 rounded-full bg-[#F3F4F6] flex items-center justify-center text-xs font-semibold text-[#6B7280]">
                      {index + 1}
                    </div>

                    {/* Type icon + info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center text-white shrink-0`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#111827] truncate">{s.title || '未命名'}</p>
                        <p className="text-xs text-[#9CA3AF]">{config.label} · ID: {s._id}</p>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="shrink-0">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        s.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.enabled ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {s.enabled ? '启用' : '禁用'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(s)}
                        className="p-2 text-[#4F46E5] hover:bg-indigo-50 rounded-lg transition"
                        title="编辑"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggle(s)}
                        disabled={toggleMut.isPending}
                        className={`p-2 rounded-lg text-xs font-medium transition ${
                          s.enabled ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={s.enabled ? '禁用' : '启用'}
                      >
                        {s.enabled ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(s)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="删除"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer help */}
        <div className="mt-6 bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h3 className="text-sm font-semibold text-[#111827] mb-3">使用说明</h3>
          <ul className="text-sm text-[#6B7280] space-y-1.5">
            <li>• <strong>拖拽排序</strong>：按住左侧拖拽手柄可调整板块在首页的显示顺序</li>
            <li>• <strong>启用/禁用</strong>：快捷控制板块是否在首页展示</li>
            <li>• <strong>文章</strong>：展示文章列表，支持按标签/时间/热度筛选</li>
            <li>• <strong>Skill 评测</strong>：展示 Skill 评测结果，支持按标签/时间/热度筛选</li>
            <li>• 筛选条件可以组合使用，实现复杂的展示需求</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
