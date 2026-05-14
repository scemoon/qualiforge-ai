import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { apiRequest, showSuccess } from '@/lib/api-client'
import Pagination from '@/components/common/Pagination'

dayjs.extend(relativeTime)

async function fetchEvaluations({ page = 1, pageSize = 20, keyword }: { page?: number; pageSize?: number; keyword?: string }) {
  return apiRequest({ action: 'list', data: { page, pageSize, keyword: keyword || undefined }, endpoint: 'evaluationCrud' })
}

async function deleteEvaluation(evaluationId: string) {
  return apiRequest({ action: 'delete', data: { evaluationId }, endpoint: 'evaluationCrud' })
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? '#059669' : score >= 60 ? '#D97706' : '#DC2626'
  return (
    <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-300" style={{ width: `${score}%`, backgroundColor: color }} />
    </div>
  )
}

function ScoreBadge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const color = score >= 80 ? '#059669' : score >= 60 ? '#D97706' : '#DC2626'
  const bg = score >= 80 ? '#ECFDF5' : score >= 60 ? '#FFFBEB' : '#FEF2F2'
  const sizes: Record<string, string> = { sm: 'text-sm px-2 py-0.5', md: 'text-base px-2.5 py-1', lg: 'text-2xl px-3 py-1.5' }
  return (
    <span className={`inline-flex items-center font-bold rounded-lg ${sizes[size]}`} style={{ backgroundColor: bg, color }}>
      {score}
    </span>
  )
}

export default function AdminEvaluation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const PAGE_SIZE = 10

  const { data: evalData, isLoading: evalLoading } = useQuery({
    queryKey: ['admin-evaluations', page, keyword],
    queryFn: () => fetchEvaluations({ page, pageSize: PAGE_SIZE, keyword }),
  })

  const deleteEvalMut = useMutation({
    mutationFn: deleteEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-evaluations'] })
      showSuccess('评测已删除')
    },
  })

  const handleSearch = () => {
    setKeyword(searchInput.trim())
    setPage(1)
  }

  const evaluations: any[] = evalData?.data?.list || []
  const total = evalData?.data?.total || 0

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC]">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#E5E7EB] bg-white shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#111827]">评测管理</h1>
            <p className="text-sm text-[#6B7280] mt-0.5">管理 AI 模型对各项 Skill 的评测数据 · 共 {total} 条</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex items-center bg-[#F3F4F6] rounded-lg overflow-hidden">
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="搜索模型名称..."
                className="bg-transparent px-3 py-2 text-sm text-[#4B5563] focus:outline-none w-40 lg:w-56"
              />
              <button onClick={handleSearch} className="px-3 py-2 text-[#9CA3AF] hover:text-[#4F46E5] transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            <button
              onClick={() => navigate('/admin/evaluations/new')}
              className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition shadow-lg shadow-indigo-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>新建评测</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#F1F5F9] bg-[#FAFAFA] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#111827]">评测记录</h2>
            <span className="text-xs text-[#9CA3AF]">共 {total} 条</span>
          </div>

          {evalLoading ? (
            <div className="flex items-center justify-center h-56">
              <div className="flex items-center gap-3 text-[#9CA3AF]">
                <div className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
                <span>加载中...</span>
              </div>
            </div>
          ) : evaluations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-56">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-sm text-[#6B7280]">暂无评测数据</p>
              <p className="text-xs text-[#9CA3AF] mt-1">点击"新建评测"开始创建</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-[#F1F5F9]">
                {evaluations.map((ev: any) => {
                  const score = parseFloat(ev.overallScore) || 0
                  const skillColor = ev.skillColor || '#6366F1'
                  const skillIcon = ev.skillIcon || '📊'
                  const skillName = ev.skillName || '未分类'
                  const dimensions = typeof ev.dimensions === 'object' && ev.dimensions !== null ? ev.dimensions : {}
                  const dimEntries = Object.entries(dimensions)

                  return (
                    <div key={ev._id} className="px-5 py-3.5 hover:bg-[#FAFAFA] transition-colors group cursor-pointer" onClick={() => navigate(`/admin/evaluations/${ev._id}`)}>
                      <div className="flex items-center gap-4">
                        {/* Skill badge */}
                        <div className="shrink-0">
                          <div
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium max-w-[140px]"
                            style={{ backgroundColor: skillColor + '18', color: skillColor, borderWidth: 1, borderColor: skillColor + '30' }}
                          >
                            <span className="text-sm leading-none shrink-0">{skillIcon}</span>
                            <span className="truncate">{skillName}</span>
                          </div>
                        </div>

                        {/* Model info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#111827] truncate">{ev.modelName}</p>
                          {ev.modelVersion && (
                            <p className="text-xs text-[#9CA3AF] mt-0.5">{ev.modelVersion}</p>
                          )}
                        </div>

                        {/* Dimension chips */}
                        {dimEntries.length > 0 && (
                          <div className="hidden lg:flex items-center gap-2 shrink-0">
                            {dimEntries.slice(0, 4).map(([k, v]: any) => (
                              <div key={k} className="text-center min-w-[38px] bg-[#F9FAFB] rounded-md px-2 py-1">
                                <div className="text-xs font-semibold text-[#111827]">{v}</div>
                                <div className="text-[10px] text-[#9CA3AF] leading-tight">{k.length > 2 ? k.slice(0, 2) : k}</div>
                              </div>
                            ))}
                            {dimEntries.length > 4 && (
                              <span className="text-xs text-[#9CA3AF]">+{dimEntries.length - 4}</span>
                            )}
                          </div>
                        )}

                        {/* Remark */}
                        {ev.remark && (
                          <div className="hidden xl:block shrink-0 max-w-[120px]">
                            <p className="text-xs text-[#9CA3AF] truncate" title={ev.remark}>{ev.remark}</p>
                          </div>
                        )}

                        {/* Score */}
                        <div className="shrink-0 text-right min-w-[90px]">
                          <ScoreBadge score={score} size="md" />
                          <div className="mt-1">
                            <ScoreBar score={score} />
                          </div>
                        </div>

                        {/* Date */}
                        <div className="shrink-0 hidden sm:block text-right min-w-[80px]">
                          <div className="text-xs text-[#9CA3AF]">
                            {ev.evaluationDate || dayjs(ev.createdAt).format('YYYY-MM-DD')}
                          </div>
                          <div className="text-[10px] text-[#C4C4C4]">
                            {ev.createdAt ? dayjs(ev.createdAt).fromNow() : ''}
                          </div>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteEvalMut.mutate(ev._id) }}
                          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
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

              {/* Pagination */}
              <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
