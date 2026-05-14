import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ResponsiveContainer from '../../components/common/ResponsiveContainer'
import { apiRequest, showSuccess } from '../../lib/api-client'

async function fetchTags() {
  return apiRequest({ action: 'listTags', endpoint: 'articleCrud' })
}

async function createTag(name: string, color: string) {
  return apiRequest({ action: 'createTag', data: { name, color }, endpoint: 'articleCrud' })
}

async function deleteTag(tagId: string) {
  return apiRequest({ action: 'deleteTag', data: { tagId }, endpoint: 'articleCrud' })
}

const colorPresets = ['#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6']

export default function AdminTag() {
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6366F1')
  const [isCreating, setIsCreating] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['tags'], queryFn: fetchTags })

  const createMut = useMutation({
    mutationFn: () => createTag(newName.trim(), newColor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      setNewName('')
      setIsCreating(false)
      showSuccess('标签已创建')
    }
  })

  const deleteMut = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      showSuccess('标签已删除')
    },
    onError: (err: any) => {
      console.error('Delete tag error:', err)
    }
  })

  const tags = data?.data?.list || []

  return (
    <ResponsiveContainer className="py-8 md:py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#111827]">标签管理</h1>
          <p className="text-[#6B7280] mt-1 text-sm">创建和管理文章标签</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-xl text-sm font-semibold hover:from-[#4338CA] hover:to-[#6D28D9] transition shadow-lg shadow-indigo-500/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isCreating ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'} />
          </svg>
          <span>{isCreating ? '取消' : '创建标签'}</span>
        </button>
      </div>

      {isCreating && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 mb-6 shadow-lg">
          <h3 className="text-lg font-semibold text-[#111827] mb-4">创建新标签</h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="标签名称"
                className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#6B7280]">颜色：</span>
                <div className="flex items-center gap-1.5">
                  {colorPresets.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewColor(color)}
                      className={`w-7 h-7 rounded-lg transition-all ${newColor === color ? 'ring-2 ring-offset-2 ring-[#4F46E5] scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <input
                    type="color"
                    value={newColor}
                    onChange={e => setNewColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0"
                  />
                </div>
              </div>
              <button
                onClick={() => { if (newName.trim()) createMut.mutate() }}
                disabled={createMut.isPending || !newName.trim()}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition shadow-lg shadow-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{createMut.isPending ? '创建中...' : '确认'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-[#9CA3AF]">
            <div className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
            <span>加载中...</span>
          </div>
        </div>
      ) : tags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#E5E7EB]">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB] flex items-center justify-center text-4xl mb-5">🏷️</div>
          <p className="text-lg font-semibold text-[#111827]">暂无标签</p>
          <p className="text-sm text-[#9CA3AF] mt-1">创建您的第一个标签</p>
          <button
            onClick={() => setIsCreating(true)}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#4F46E5] text-white rounded-xl text-sm font-medium hover:bg-[#4338CA] transition"
          >
            <span>创建标签</span>
            <span>→</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tags.map((tag: any) => (
            <div
              key={tag._id}
              className="group bg-white rounded-2xl border border-[#E5E7EB] p-4 hover:border-transparent hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl shadow-md"
                  style={{ backgroundColor: tag.color || '#6366F1' }}
                />
                <button
                  onClick={() => deleteMut.mutate(tag._id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 bg-red-50 text-red-500 hover:bg-red-100 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <h3 className="font-semibold text-[#111827] mb-1 truncate">{tag.name}</h3>
              <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tag.color || '#6366F1' }}
                />
                <span className="font-mono truncate">{tag._id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </ResponsiveContainer>
  )
}