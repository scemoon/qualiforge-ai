import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import ResponsiveContainer from '../../components/common/ResponsiveContainer'

async function fetchEvaluations({ page = 1, skillId }: { page?: number; skillId?: string }) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/evaluation-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list', data: { page, pageSize: 50, skillId } }),
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

type Tab = 'evaluation' | 'skill'

export default function AdminEvaluation() {
  const [tab, setTab] = useState<Tab>('evaluation')
  const [skillIdFilter, setSkillIdFilter] = useState('')
  const [showEvalForm, setShowEvalForm] = useState(false)
  const [showSkillForm, setShowSkillForm] = useState(false)
  const [evalForm, setEvalForm] = useState({ modelName: '', modelVersion: '', skillId: '', overallScore: '', dimensions: '', remark: '' })
  const [skillForm, setSkillForm] = useState({ name: '', description: '', icon: '💻', color: '#6366F1' })
  const queryClient = useQueryClient()

  const { data: evalData, isLoading: evalLoading } = useQuery({
    queryKey: ['admin-evaluations', skillIdFilter],
    queryFn: () => fetchEvaluations({ page: 1, skillId: skillIdFilter || undefined }),
  })

  const { data: skillsData } = useQuery({ queryKey: ['skills'], queryFn: fetchSkills })

  const createEvalMut = useMutation({
    mutationFn: createEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-evaluations'] })
      setShowEvalForm(false)
      setEvalForm({ modelName: '', modelVersion: '', skillId: '', overallScore: '', dimensions: '', remark: '' })
    }
  })

  const deleteEvalMut = useMutation({
    mutationFn: deleteEvaluation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-evaluations'] })
  })

  const createSkillMut = useMutation({
    mutationFn: () => createSkill(skillForm.name, skillForm.description, skillForm.icon, skillForm.color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      setShowSkillForm(false)
      setSkillForm({ name: '', description: '', icon: '💻', color: '#6366F1' })
    }
  })

  const deleteSkillMut = useMutation({
    mutationFn: deleteSkill,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] })
  })

  const evaluations = evalData?.data?.list || []
  const skills = skillsData?.data?.list || []

  return (
    <ResponsiveContainer className="py-6 md:py-8">
      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-[#F3F4F6] rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('evaluation')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${tab === 'evaluation' ? 'bg-white text-[#4F46E5] shadow' : 'text-[#6B7280] hover:text-[#111827]'}`}
        >
          评测记录
        </button>
        <button
          onClick={() => setTab('skill')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${tab === 'skill' ? 'bg-white text-[#4F46E5] shadow' : 'text-[#6B7280] hover:text-[#111827]'}`}
        >
          Skill 管理
        </button>
      </div>

      {/* ============ 评测记录 ============ */}
      {tab === 'evaluation' && (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
            <select
              className="border border-[#E5E7EB] rounded-md px-3 py-1.5 text-sm w-full sm:w-40"
              value={skillIdFilter}
              onChange={e => setSkillIdFilter(e.target.value)}
            >
              <option value="">全部 Skill</option>
              {skills.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <button
              onClick={() => setShowEvalForm(s => !s)}
              className="px-4 py-1.5 bg-[#4F46E5] text-white rounded-md text-sm hover:bg-[#4338CA] transition w-full sm:w-auto"
            >
              + 添加评测
            </button>
          </div>

          {showEvalForm && (
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 mb-4">
              <h3 className="font-medium text-[#111827] mb-3">添加评测数据</h3>
              <div className="space-y-3 mb-3">
                <div className="grid grid-cols-2 gap-3">
                  <input value={evalForm.modelName} onChange={e => setEvalForm({ ...evalForm, modelName: e.target.value })} placeholder="模型名称 *" className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm" />
                  <input value={evalForm.modelVersion} onChange={e => setEvalForm({ ...evalForm, modelVersion: e.target.value })} placeholder="模型版本" className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <select value={evalForm.skillId} onChange={e => setEvalForm({ ...evalForm, skillId: e.target.value })} className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm">
                    <option value="">选择 Skill</option>
                    {skills.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                  <input value={evalForm.overallScore} onChange={e => setEvalForm({ ...evalForm, overallScore: e.target.value })} placeholder="综合评分 0-100 *" type="number" className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm" />
                </div>
                <input value={evalForm.dimensions} onChange={e => setEvalForm({ ...evalForm, dimensions: e.target.value })} placeholder='四维JSON {"correctness":0,...}' className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm w-full" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!evalForm.modelName || !evalForm.overallScore) { alert('模型名称和评分必填'); return }
                    createEvalMut.mutate({ ...evalForm, dimensions: evalForm.dimensions ? JSON.parse(evalForm.dimensions) : {} })
                  }}
                  disabled={createEvalMut.isPending}
                  className="px-4 py-2 bg-[#10B981] text-white rounded-md text-sm hover:bg-[#059669] disabled:opacity-50"
                >
                  {createEvalMut.isPending ? '保存中...' : '保存'}
                </button>
                <button onClick={() => setShowEvalForm(false)} className="px-4 py-2 border border-[#E5E7EB] rounded-md text-sm">取消</button>
              </div>
            </div>
          )}

          {evalLoading ? (
            <div className="text-center py-12 text-[#9CA3AF]">加载中...</div>
          ) : evaluations.length === 0 ? (
            <div className="text-center py-16 text-[#9CA3AF]">暂无评测数据</div>
          ) : (
            <div className="space-y-3">
              {evaluations.map((ev: any) => (
                <div key={ev._id} className="bg-white rounded-lg border border-[#E5E7EB] p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[#111827]">{ev.modelName}</div>
                    <div className="text-xs text-[#9CA3AF] mt-0.5">{ev.modelVersion || '-'} · {ev.skillName || '-'}</div>
                  </div>
                  <span className="text-xl font-bold text-[#4F46E5] flex-shrink-0">{ev.overallScore}</span>
                  <span className="text-xs text-[#9CA3AF] flex-shrink-0">{dayjs(ev.createdAt).format('YYYY-MM-DD')}</span>
                  <button onClick={() => deleteEvalMut.mutate(ev._id)} className="text-[#EF4444] hover:underline text-xs flex-shrink-0">删除</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ============ Skill 管理 ============ */}
      {tab === 'skill' && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowSkillForm(s => !s)}
              className="px-4 py-1.5 bg-[#4F46E5] text-white rounded-md text-sm hover:bg-[#4338CA] transition"
            >
              + 新建 Skill
            </button>
          </div>

          {showSkillForm && (
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 mb-4">
              <h3 className="font-medium text-[#111827] mb-3">新建 Skill</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <input value={skillForm.name} onChange={e => setSkillForm({ ...skillForm, name: e.target.value })} placeholder="Skill 名称 *" className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm" />
                <input value={skillForm.description} onChange={e => setSkillForm({ ...skillForm, description: e.target.value })} placeholder="描述" className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm sm:col-span-1 md:col-span-2" />
                <div className="flex gap-2 items-center">
                  <input type="color" value={skillForm.color} onChange={e => setSkillForm({ ...skillForm, color: e.target.value })} className="w-10 h-10 rounded cursor-pointer flex-shrink-0" />
                  <button
                    onClick={() => { if (!skillForm.name) { alert('名称必填'); return }; createSkillMut.mutate() }}
                    disabled={createSkillMut.isPending}
                    className="px-3 py-2 bg-[#10B981] text-white rounded-md text-sm hover:bg-[#059669] disabled:opacity-50 flex-1"
                  >
                    {createSkillMut.isPending ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <button onClick={() => setShowSkillForm(false)} className="text-xs text-[#9CA3AF] hover:text-[#6B7280]">取消</button>
              </div>
            </div>
          )}

          {skills.length === 0 ? (
            <div className="text-center py-16 text-[#9CA3AF]">暂无 Skill</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((s: any) => (
                <div key={s._id} className="bg-white rounded-lg border border-[#E5E7EB] p-4 flex items-center gap-3">
                  <span className="text-2xl flex-shrink-0">{s.icon || '💻'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#111827] truncate">{s.name}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5 line-clamp-1">{s.description}</p>
                  </div>
                  <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: s.color || '#6366F1' }} />
                  <button onClick={() => deleteSkillMut.mutate(s._id)} className="text-[#EF4444] hover:underline text-xs flex-shrink-0">删除</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </ResponsiveContainer>
  )
}
