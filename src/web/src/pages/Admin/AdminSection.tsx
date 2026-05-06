import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ResponsiveContainer from '../../components/common/ResponsiveContainer'

async function fetchSections() {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/section-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list' }),
  })
  return res.json()
}

async function createSection(title: string, type: string, config: any) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/section-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create', data: { title, type, config, visibility: 'public', order: 99 } }),
  })
  return res.json()
}

async function deleteSection(sectionId: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/section-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', data: { sectionId } }),
  })
  return res.json()
}

const typeTag = (t: string) => t === 'article_list' ? '📝 文章列表' : t === 'skill_leaderboard' ? '📊 榜单' : '🔗 外链'

export default function AdminSection() {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('article_list')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['admin-sections'], queryFn: fetchSections })
  const createMut = useMutation({
    mutationFn: () => createSection(title, type, { articleIds: [], limit: 5 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sections'] })
      setTitle('')
    }
  })
  const deleteMut = useMutation({
    mutationFn: deleteSection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-sections'] })
  })

  const sections = data?.data?.list || []

  return (
    <ResponsiveContainer className="py-6 md:py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-4 md:mb-6">板块管理</h1>

      <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="板块名称" className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm flex-1" />
          <select value={type} onChange={e => setType(e.target.value)} className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm sm:w-36">
            <option value="article_list">文章列表</option>
            <option value="skill_leaderboard">Skill 榜单</option>
            <option value="external_link">外链</option>
          </select>
          <button
            onClick={() => { if (title.trim()) createMut.mutate() }}
            disabled={createMut.isPending}
            className="px-4 py-2 bg-[#4F46E5] text-white rounded-md text-sm hover:bg-[#4338CA] disabled:opacity-50 whitespace-nowrap"
          >
            {createMut.isPending ? '创建中...' : '创建板块'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#9CA3AF]">加载中...</div>
      ) : sections.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3AF]">暂无板块</div>
      ) : (
        <div className="space-y-3">
          {sections.map((s: any) => (
            <div key={s._id} className="bg-white rounded-lg border border-[#E5E7EB] p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#111827]">{s.title}</p>
                <p className="text-xs text-[#9CA3AF] mt-1">ID: {s._id}</p>
                <p className="text-xs text-[#9CA3AF]">{typeTag(s.type)} · {s.visibility}</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <span className={`px-2 py-0.5 rounded text-xs ${s.enabled ? 'bg-[#10B981] text-white' : 'bg-[#EF4444] text-white'}`}>
                  {s.enabled ? '启用' : '禁用'}
                </span>
                <button onClick={() => deleteMut.mutate(s._id)} className="text-[#EF4444] hover:underline text-sm">删除</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ResponsiveContainer>
  )
}