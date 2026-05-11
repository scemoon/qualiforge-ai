import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ResponsiveContainer from '../../components/common/ResponsiveContainer'

const API = 'https://cloud1-2gavd8kj8a1ce021.service.tcloudbase.com/api/forge'

async function fetchSections() {
  const res = await fetch(`${API}/section-crud`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list' }),
  })
  return res.json()
}

async function createSection(title: string, type: string) {
  let config: any = {}
  if (type === 'article_list') config = { articleIds: [], limit: 8 }
  else if (type === 'skill_leaderboard') config = { skillId: '', limit: 10 }
  else if (type === 'external_link') config = { url: '', description: '' }

  const res = await fetch(`${API}/section-crud`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create', data: { title, type, config, enabled: true, order: 99 } }),
  })
  return res.json()
}

async function updateSection(sectionId: string, data: any) {
  const res = await fetch(`${API}/section-crud`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update', data: { sectionId, ...data } }),
  })
  return res.json()
}

async function deleteSection(sectionId: string) {
  const res = await fetch(`${API}/section-crud`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', data: { sectionId } }),
  })
  return res.json()
}

const typeLabel: Record<string, string> = {
  article_list: '📝 文章列表',
  skill_leaderboard: '📊 Skill 榜单',
  external_link: '🔗 外链',
}

export default function AdminSection() {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('article_list')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['admin-sections'], queryFn: fetchSections })

  const createMut = useMutation({
    mutationFn: () => createSection(title.trim(), type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sections'] })
      setTitle('')
    }
  })

  const toggleMut = useMutation({
    mutationFn: ({ sectionId, enabled }: { sectionId: string; enabled: boolean }) =>
      updateSection(sectionId, { enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-sections'] })
  })

  const deleteMut = useMutation({
    mutationFn: deleteSection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-sections'] })
  })

  const sections = data?.data?.list || []

  return (
    <ResponsiveContainer className="py-6 md:py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-6">板块管理</h1>

      {/* 创建板块 */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="板块名称"
            className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm flex-1"
          />
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm sm:w-40"
          >
            <option value="article_list">📝 文章列表</option>
            <option value="skill_leaderboard">📊 Skill 榜单</option>
            <option value="external_link">🔗 外链</option>
          </select>
          <button
            onClick={() => { if (title.trim()) createMut.mutate() }}
            disabled={createMut.isPending}
            className="px-4 py-2 bg-[#4F46E5] text-white rounded-md text-sm hover:bg-[#4338CA] disabled:opacity-50 whitespace-nowrap"
          >
            {createMut.isPending ? '创建中...' : '+ 创建板块'}
          </button>
        </div>
      </div>

      {/* 板块列表 */}
      {isLoading ? (
        <div className="text-center py-12 text-[#9CA3AF]">加载中...</div>
      ) : sections.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3AF]">暂无板块</div>
      ) : (
        <div className="space-y-3">
          {sections.map((s: any) => (
            <div key={s._id} className="bg-white rounded-lg border border-[#E5E7EB] p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex-1 min-w-0 w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-[#111827]">{s.title}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${s.enabled ? 'bg-[#10B981] text-white' : 'bg-[#9CA3AF] text-white'}`}>
                    {s.enabled ? '启用' : '禁用'}
                  </span>
                  <span className="text-xs text-[#9CA3AF] bg-[#F3F4F6] px-2 py-0.5 rounded">
                    {typeLabel[s.type] || s.type}
                  </span>
                </div>
                <p className="text-xs text-[#9CA3AF] mt-1">ID: {s._id}</p>
                <p className="text-xs text-[#9CA3AF]">
                  {Array.isArray(s.articles) ? `📝 ${s.articles.length} 篇文章` : ''}
                  {Array.isArray(s.evaluations) ? ` 🧪 ${s.evaluations.length} 评测` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {/* 启用/禁用切换 */}
                <button
                  onClick={() => toggleMut.mutate({ sectionId: s._id, enabled: !s.enabled })}
                  disabled={toggleMut.isPending}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition ${
                    s.enabled
                      ? 'border-[#10B981] text-[#10B981] hover:bg-[#10B981] hover:text-white'
                      : 'border-[#9CA3AF] text-[#9CA3AF] hover:bg-[#10B981] hover:text-white'
                  }`}
                >
                  {s.enabled ? '禁用' : '启用'}
                </button>
                {/* 删除 */}
                <button
                  onClick={() => { if (confirm(`确定删除板块「${s.title}」？`)) deleteMut.mutate(s._id) }}
                  className="text-[#EF4444] hover:bg-[#EF4444] hover:text-white px-3 py-1.5 rounded-md text-xs font-medium border border-[#EF4444] transition"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ResponsiveContainer>
  )
}