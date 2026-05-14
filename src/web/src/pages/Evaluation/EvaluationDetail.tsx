import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlock from '@tiptap/extension-code-block'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { apiRequest } from '@/lib/api-client'
import ResponsiveContainer from '@/components/common/ResponsiveContainer'

dayjs.extend(relativeTime)

async function fetchEvaluation(id: string) {
  return apiRequest({ action: 'get', data: { evaluationId: id }, endpoint: 'evaluationCrud' })
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? '#059669' : score >= 60 ? '#D97706' : '#DC2626'
  return (
    <div className="w-full h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, backgroundColor: color }} />
    </div>
  )
}

function TiptapViewer({ content }: { content: string }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({ inline: true, allowBase64: true }),
      Link.configure({ openOnClick: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder,
      CodeBlock,
      Subscript,
      Superscript,
    ],
    content,
    editable: false,
    immediatelyRender: false,
  })

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content)
    }
  }, [editor, content])

  if (!editor) {
    return <div className="text-[#9CA3AF]">加载中...</div>
  }

  return (
    <div className="tiptap-viewer">
      <EditorContent editor={editor} />
    </div>
  )
}

export default function EvaluationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [evaluation, setEvaluation] = useState<any>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['evaluation-detail', id],
    queryFn: () => fetchEvaluation(id!),
    enabled: !!id,
  })

  useEffect(() => {
    if (data?.data) {
      setEvaluation(data.data)
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#9CA3AF]">加载中...</span>
        </div>
      </div>
    )
  }

  if (error || !evaluation) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-5xl">😕</div>
          <h2 className="text-lg font-semibold text-[#111827]">加载失败</h2>
          <p className="text-sm text-[#9CA3AF]">无法获取评测详情，请稍后重试</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition"
          >
            返回列表
          </button>
        </div>
      </div>
    )
  }

  const score = parseFloat(evaluation.overallScore) || 0
  const skillColor = evaluation.skillColor || '#6366F1'
  const skillIcon = evaluation.skillIcon || '📊'
  const dimensions = typeof evaluation.dimensions === 'object' && evaluation.dimensions !== null ? evaluation.dimensions : {}
  const dimEntries = Object.entries(dimensions)

  return (
<div className="h-screen flex flex-col bg-[#F8FAFC] overflow-hidden">
      <header className="flex-shrink-0 bg-white border-b border-[#E5E7EB]">
        <ResponsiveContainer>
          <div className="h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#F3F4F6] text-[#4B5563] transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
              </button>
              <span className="text-media font-bold text-[#6B7280] truncate max-w-[200px] sm:max-w-[500px]">{evaluation.title}</span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-3 text-sm text-[#6B7280] pr-2">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {dayjs(evaluation.createdAt).format('YYYY-MM-DD')}
                </span>
                <span className="text-[#D1D5DB] hidden sm:inline">·</span>
                <span className="flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center text-xs"
                    style={{ backgroundColor: skillColor + '18', color: skillColor }}
                  >
                    {skillIcon}
                  </div>
                  <span className="hidden xs:inline">{evaluation.modelName}</span>
                </span>
              </div>

              <button
                onClick={() => navigate(`/evaluations/${id}/edit`)}
                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#4F46E5] text-white rounded-lg text-sm font-medium hover:bg-[#4338CA] transition shadow-lg shadow-indigo-500/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="hidden sm:inline">编辑</span>
              </button>
            </div>
          </div>
        </ResponsiveContainer>
      </header>

      <div className="flex-1 overflow-y-auto">
        <ResponsiveContainer className="py-4 md:py-6 space-y-4">
          {evaluation.coverImage && (
            <div className="rounded-xl overflow-hidden">
              <img src={evaluation.coverImage} alt="" className="w-full h-40 md:h-48 object-cover" />
            </div>
          )}

          {evaluation.tags && evaluation.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {evaluation.tags.map((tag: any) => (
                <span
                  key={tag._id || tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-[#F3F4F6] text-[#6B7280]"
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color || '#6366F1' }}
                  />
                  {tag.name || tag}
                </span>
              ))}
            </div>
          )}

          <div className="bg-white rounded-xl md:rounded-2xl border border-[#E5E7EB] p-4 md:p-6">
            <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#4F46E5] rounded-full" />
              Skill 信息
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: skillColor + '18' }}
                >
                  {skillIcon}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#111827]">{evaluation.skillName || '未分类'}</p>
                  {evaluation.skillDescription && (
                    <p className="text-xs text-[#9CA3AF]">{evaluation.skillDescription}</p>
                  )}
                </div>
              </div>
            </div>

            {evaluation.skillTags && (
              <div className="mt-3">
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">标签</label>
                <p className="text-sm text-[#111827]">{evaluation.skillTags}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl border border-[#E5E7EB] p-4 md:p-6">
            <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#4F46E5] rounded-full" />
              模型信息
            </h3>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">模型名称</label>
                <p className="text-sm text-[#111827] font-medium">{evaluation.modelName || '-'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1">版本</label>
                <p className="text-sm text-[#111827]">{evaluation.modelVersion || '-'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl border border-[#E5E7EB] p-4 md:p-6">
            <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#4F46E5] rounded-full" />
              综合评分
            </h3>
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold"
                style={{
                  backgroundColor: score >= 80 ? '#ECFDF5' : score >= 60 ? '#FFFBEB' : '#FEF2F2',
                  color: score >= 80 ? '#059669' : score >= 60 ? '#D97706' : '#DC2626'
                }}
              >
                {score}
              </div>
              <div className="flex-1">
                <ScoreBar score={score} />
                <p className="text-xs text-[#9CA3AF] mt-1">
                  {evaluation.evaluationDate || dayjs(evaluation.createdAt).format('YYYY-MM-DD')}
                </p>
              </div>
            </div>
          </div>

          {dimEntries.length > 0 && (
            <div className="bg-white rounded-xl md:rounded-2xl border border-[#E5E7EB] p-4 md:p-6">
              <h3 className="text-sm font-semibold text-[#111827] mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-[#4F46E5] rounded-full" />
                维度评分
              </h3>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                {dimEntries.map(([key, value]) => {
                  const dimScore = parseFloat(String(value)) || 0
                  const color = dimScore >= 80 ? '#059669' : dimScore >= 60 ? '#D97706' : '#DC2626'
                  return (
                    <div key={key} className="bg-[#F9FAFB] rounded-lg p-3 border border-[#E5E7EB]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-[#4B5563]">{key}</span>
                        <span className="text-lg font-bold" style={{ color }}>{dimScore}</span>
                      </div>
                      <ScoreBar score={dimScore} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {evaluation.remark && (
            <div className="bg-white rounded-xl md:rounded-2xl border border-[#E5E7EB] p-4 md:p-6">
              <h3 className="text-sm font-semibold text-[#111827] mb-2 flex items-center gap-2">
                <span className="w-1 h-4 bg-[#4F46E5] rounded-full" />
                备注
              </h3>
              <p className="text-sm text-[#6B7280]">{evaluation.remark}</p>
            </div>
          )}

          <div className="bg-white rounded-xl md:rounded-2xl border border-[#E5E7EB] p-4 md:p-6">
            <h3 className="text-sm font-semibold text-[#374151] mb-3">评测内容</h3>
            {evaluation.content ? (
              <TiptapViewer content={evaluation.content} />
            ) : (
              <p className="text-[#9CA3AF]">暂无内容</p>
            )}
          </div>
        </ResponsiveContainer>
      </div>
    </div>
  )
}