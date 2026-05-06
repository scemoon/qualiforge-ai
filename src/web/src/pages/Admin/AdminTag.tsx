import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ResponsiveContainer from '../../components/common/ResponsiveContainer'

async function fetchTags() {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'listTags' }),
  })
  return res.json()
}

async function createTag(name: string, color: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'createTag', data: { name, color } }),
  })
  return res.json()
}

async function deleteTag(tagId: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/article-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'deleteTag', data: { tagId } }),
  })
  return res.json()
}

export default function AdminTag() {
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6366F1')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['tags'], queryFn: fetchTags })
  const createMut = useMutation({
    mutationFn: ({ name, color }: { name: string; color: string }) => createTag(name, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      setNewName('')
    }
  })
  const deleteMut = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] })
  })

  const tags = data?.data?.list || []

  return (
    <ResponsiveContainer className="py-6 md:py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-4 md:mb-6">标签管理</h1>

      {/* Create tag form */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 mb-4 md:mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="标签名称" className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm flex-1" />
        <div className="flex items-center gap-3">
          <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
          <button
            onClick={() => { if (newName.trim()) createMut.mutate({ name: newName.trim(), color: newColor }) }}
            disabled={createMut.isPending}
            className="px-4 py-2 bg-[#4F46E5] text-white rounded-md text-sm hover:bg-[#4338CA] transition disabled:opacity-50 whitespace-nowrap"
          >
            {createMut.isPending ? '创建中...' : '创建标签'}
          </button>
        </div>
      </div>

      {/* Tags list */}
      {isLoading ? (
        <div className="text-center py-12 text-[#9CA3AF]">加载中...</div>
      ) : tags.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3AF]">暂无标签</div>
      ) : (
        <>
          {/* Desktop: Table */}
          <div className="hidden md:block bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="text-left px-4 py-3 text-[#4B5563] font-medium">颜色</th>
                  <th className="text-left px-4 py-3 text-[#4B5563] font-medium">名称</th>
                  <th className="text-center px-4 py-3 text-[#4B5563] font-medium">ID</th>
                  <th className="text-center px-4 py-3 text-[#4B5563] font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {tags.map((tag: any) => (
                  <tr key={tag._id} className="border-b border-[#F3F4F6]">
                    <td className="px-4 py-3"><span className="w-6 h-6 rounded-full inline-block" style={{ backgroundColor: tag.color || '#6366F1' }} /></td>
                    <td className="px-4 py-3 font-medium text-[#111827]">{tag.name}</td>
                    <td className="text-center px-4 py-3 text-xs text-[#9CA3AF] font-mono">{tag._id}</td>
                    <td className="text-center px-4 py-3">
                      <button onClick={() => deleteMut.mutate(tag._id)} className="text-[#EF4444] hover:underline text-sm">删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: Cards */}
          <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tags.map((tag: any) => (
              <div key={tag._id} className="bg-white rounded-lg border border-[#E5E7EB] p-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color || '#6366F1' }} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#111827]">{tag.name}</p>
                  <p className="text-xs text-[#9CA3AF] font-mono truncate">{tag._id}</p>
                </div>
                <button onClick={() => deleteMut.mutate(tag._id)} className="text-[#EF4444] hover:underline text-sm flex-shrink-0">删除</button>
              </div>
            ))}
          </div>
        </>
      )}
    </ResponsiveContainer>
  )
}