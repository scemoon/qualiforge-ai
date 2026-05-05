import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

async function fetchSkills() {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/skill-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list' }),
  })
  return res.json()
}

async function createSkill(name: string, description: string, icon: string, color: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/skill-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create', data: { name, description, icon, color } }),
  })
  return res.json()
}

async function deleteSkill(skillId: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/skill-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', data: { skillId } }),
  })
  return res.json()
}

export default function AdminSkill() {
  const [form, setForm] = useState({ name: '', description: '', icon: '💻', color: '#6366F1' })
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['skills'], queryFn: fetchSkills })
  const createMut = useMutation({
    mutationFn: () => createSkill(form.name, form.description, form.icon, form.color),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['skills'] }); setForm({ name: '', description: '', icon: '💻', color: '#6366F1' }) }
  })
  const deleteMut = useMutation({ mutationFn: deleteSkill, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }) })

  const skills = data?.data?.list || []

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111827] mb-6">Skill 管理</h1>

      <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 mb-6 grid grid-cols-4 gap-3">
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Skill 名称" className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm" />
        <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="描述" className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm col-span-2" />
        <div className="flex gap-2">
          <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-10 rounded cursor-pointer" />
          <button onClick={() => form.name && createMut.mutate()} disabled={createMut.isPending} className="px-3 py-2 bg-[#4F46E5] text-white rounded-md text-sm hover:bg-[#4338CA] disabled:opacity-50">创建</button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#9CA3AF]">加载中...</div>
      ) : skills.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3AF]">暂无 Skill</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((s: any) => (
            <div key={s._id} className="bg-white rounded-lg border border-[#E5E7EB] p-4 flex items-center gap-3">
              <span className="text-2xl">{s.icon || '📊'}</span>
              <div className="flex-1">
                <p className="font-medium text-[#111827]">{s.name}</p>
                <p className="text-xs text-[#9CA3AF] mt-0.5">{s.description}</p>
              </div>
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: s.color || '#6366F1' }} />
              <button onClick={() => deleteMut.mutate(s._id)} className="text-[#EF4444] hover:underline text-xs">删除</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
