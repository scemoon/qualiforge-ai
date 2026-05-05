import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'

async function fetchEvaluations({ page = 1, skillId }: { page?: number; skillId?: string }) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/evaluation-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list', data: { page, pageSize: 20, skillId } }),
  })
  return res.json()
}

async function fetchSkills() {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/skill-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list' }),
  })
  return res.json()
}

async function createEvaluation(data: any) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/evaluation-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create', data }),
  })
  return res.json()
}

async function deleteEvaluation(evaluationId: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/evaluation-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', data: { evaluationId } }),
  })
  return res.json()
}

export default function AdminEvaluation() {
  const [page] = useState(1)
  const [skillId, setSkillId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ modelName: '', modelVersion: '', skillId: '', overallScore: '', dimensions: '', remark: '' })
  const queryClient = useQueryClient()

  const { data: evalData, isLoading } = useQuery({
    queryKey: ['admin-evaluations', page, skillId],
    queryFn: () => fetchEvaluations({ page, skillId: skillId || undefined }),
  })

  const { data: skillsData } = useQuery({ queryKey: ['skills'], queryFn: fetchSkills })

  const createMut = useMutation({
    mutationFn: createEvaluation,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-evaluations'] }); setShowForm(false); setForm({ modelName: '', modelVersion: '', skillId: '', overallScore: '', dimensions: '', remark: '' }) }
  })

  const deleteMut = useMutation({
    mutationFn: deleteEvaluation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-evaluations'] })
  })

  const evaluations = evalData?.data?.list || []
  const skills = skillsData?.data?.list || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">评测管理</h1>
        <div className="flex items-center gap-3">
          <select className="border border-[#E5E7EB] rounded-md px-3 py-1.5 text-sm" value={skillId} onChange={e => setSkillId(e.target.value)}>
            <option value="">全部 Skill</option>
            {skills.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <button onClick={() => setShowForm(s => !s)} className="px-4 py-1.5 bg-[#4F46E5] text-white rounded-md text-sm hover:bg-[#4338CA] transition">
            + 添加评测
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 mb-6">
          <h3 className="font-medium text-[#111827] mb-3">添加评测数据</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            <input value={form.modelName} onChange={e => setForm({ ...form, modelName: e.target.value })} placeholder="模型名称 *" className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm" />
            <input value={form.modelVersion} onChange={e => setForm({ ...form, modelVersion: e.target.value })} placeholder="模型版本" className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm" />
            <select value={form.skillId} onChange={e => setForm({ ...form, skillId: e.target.value })} className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm">
              <option value="">选择 Skill</option>
              {skills.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <input value={form.overallScore} onChange={e => setForm({ ...form, overallScore: e.target.value })} placeholder="综合评分 0-100 *" type="number" className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm" />
            <input value={form.dimensions} onChange={e => setForm({ ...form, dimensions: e.target.value })} placeholder="四维JSON {correctness:0,...}" className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm col-span-2" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => createMut.mutate({ ...form, dimensions: form.dimensions ? JSON.parse(form.dimensions) : {} })} disabled={createMut.isPending} className="px-4 py-2 bg-[#10B981] text-white rounded-md text-sm hover:bg-[#059669] disabled:opacity-50">
              {createMut.isPending ? '创建中...' : '保存'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-[#E5E7EB] rounded-md text-sm">取消</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-[#9CA3AF]">加载中...</div>
      ) : evaluations.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3Af]">暂无评测数据</div>
      ) : (
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="text-left px-4 py-3 text-[#4B5563] font-medium">模型</th>
                <th className="text-center px-4 py-3 text-[#4B5563] font-medium">Skill</th>
                <th className="text-center px-4 py-3 text-[#4B5563] font-medium">综合</th>
                <th className="text-center px-4 py-3 text-[#4B5563] font-medium">四维评分</th>
                <th className="text-center px-4 py-3 text-[#4B5563] font-medium">日期</th>
                <th className="text-center px-4 py-3 text-[#4B5563] font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((ev: any) => (
                <tr key={ev._id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#111827]">{ev.modelName}</div>
                    <div className="text-xs text-[#9CA3AF]">{ev.modelVersion}</div>
                  </td>
                  <td className="text-center px-4 py-3 text-[#4B5563]">{ev.skillName || '-'}</td>
                  <td className="text-center px-4 py-3">
                    <span className="font-bold text-[#4F46E5] text-lg">{ev.overallScore}</span>
                  </td>
                  <td className="text-center px-4 py-3 text-xs text-[#9CA3AF] font-mono">
                    {ev.dimensions ? JSON.stringify(ev.dimensions).slice(0, 30) : '-'}
                  </td>
                  <td className="text-center px-4 py-3 text-[#9CA3AF] text-xs">
                    {ev.evaluationDate || dayjs(ev.createdAt).format('YYYY-MM-DD')}
                  </td>
                  <td className="text-center px-4 py-3">
                    <button onClick={() => deleteMut.mutate(ev._id)} className="text-[#EF4444] hover:underline text-sm">删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
