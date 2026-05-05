import { useSearchParams, Link } from 'react-router-dom'

import { useQuery } from '@tanstack/react-query'

async function fetchSkills() {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/skill-crud', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list' }),
  })
  return res.json()
}

async function fetchEvaluations(skillId?: string) {
  const body: any = { action: 'list' }
  if (skillId) body.data = { skillId }
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/evaluation-crud', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

export default function Leaderboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentSkill = searchParams.get('skill') || ''

  const { data: skillsData } = useQuery({ queryKey: ['skills'], queryFn: fetchSkills })
  const { data: evalData, isLoading } = useQuery({
    queryKey: ['evaluations', currentSkill],
    queryFn: () => fetchEvaluations(currentSkill || undefined),
  })

  const skills = skillsData?.data?.list || []
  const evaluations = evalData?.data?.list || []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#111827] mb-2">Skill 评测榜单</h1>
        <p className="text-[#4B5563]">客观、可复现的 AI Coding 质量评测结果</p>
      </div>

      {/* Skill Filter */}
      <div className="mb-6 flex items-center gap-4">
        <span className="text-sm text-[#4B5563]">选择 Skill：</span>
        <select
          className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm"
          value={currentSkill}
          onChange={(e) => {
            const v = e.target.value
            setSearchParams(v ? { skill: v } : {})
          }}
        >
          <option value="">全部 Skill</option>
          {skills.map((s: any) => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-[#9CA3AF]">加载中...</div>
      ) : evaluations.length === 0 ? (
        <div className="text-center py-12 text-[#9CA3AF]">暂无评测数据</div>
      ) : (
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-[#4B5563]">模型</th>
                <th className="text-center px-4 py-3 font-medium text-[#4B5563]">综合</th>
                <th className="text-center px-4 py-3 font-medium text-[#10B981]">正确性</th>
                <th className="text-center px-4 py-3 font-medium text-[#EF4444]">安全性</th>
                <th className="text-center px-4 py-3 font-medium text-[#0EA5E9]">可维护性</th>
                <th className="text-center px-4 py-3 font-medium text-[#F59E0B]">鲁棒性</th>
                <th className="text-center px-4 py-3 font-medium text-[#4B5563]">评测日期</th>
                <th className="text-center px-4 py-3 font-medium text-[#4B5563]">详情</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map((ev: any) => (
                <tr key={ev._id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#111827]">{ev.modelName}</div>
                    <div className="text-xs text-[#9CA3AF]">{ev.modelVersion}</div>
                  </td>
                  <td className="text-center px-4 py-3">
                    <span className="font-bold text-[#4F46E5] text-base">{ev.overallScore}</span>
                  </td>
                  <td className="text-center px-4 py-3 text-[#10B981]">{ev.dimensions?.correctness}</td>
                  <td className="text-center px-4 py-3 text-[#EF4444]">{ev.dimensions?.security}</td>
                  <td className="text-center px-4 py-3 text-[#0EA5E9]">{ev.dimensions?.maintainability}</td>
                  <td className="text-center px-4 py-3 text-[#F59E0B]">{ev.dimensions?.robustness}</td>
                  <td className="text-center px-4 py-3 text-[#9CA3AF] text-xs">{ev.evaluationDate}</td>
                  <td className="text-center px-4 py-3">
                    <Link to={`/article/${ev.articleId}`} className="text-[#4F46E5] hover:underline text-sm">
                      查看详情
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Methodology link */}
      <div className="mt-6 text-center">
        <a href="#" className="text-sm text-[#4F46E5] hover:underline">📖 评测方法论</a>
      </div>
    </div>
  )
}
