import { useState } from 'react'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const [jumpInput, setJumpInput] = useState('')

  if (total <= 0) return null


  const handleJump = () => {
    const num = parseInt(jumpInput, 10)
    if (!isNaN(num) && num >= 1 && num <= totalPages) {
      onPageChange(num)
    }
    setJumpInput('')
  }

  const renderPageButtons = () => {
    const maxVisible = 5
    let start = Math.max(1, page - Math.floor(maxVisible / 2))
    let end = start + maxVisible - 1
    if (end > totalPages) { end = totalPages; start = Math.max(1, end - maxVisible + 1) }
    const buttons: (number | '...')[] = []
    if (start > 1) { buttons.push(1); if (start > 2) buttons.push('...') }
    for (let i = start; i <= end; i++) buttons.push(i)
    if (end < totalPages) { if (end < totalPages - 1) buttons.push('...'); buttons.push(totalPages) }
    return buttons.map((p, i) => (
      p === '...' ? (
        <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-[#9CA3AF]">...</span>
      ) : (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition ${
            page === p
              ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-500/20'
              : 'border border-[#E5E7EB] text-[#6B7280] hover:bg-white hover:border-[#4F46E5] hover:text-[#4F46E5]'
          }`}
        >
          {p}
        </button>
      )
    ))
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 p-4">
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-sm text-[#6B7280] hover:bg-white hover:border-[#4F46E5] hover:text-[#4F46E5] transition disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            title="首页"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-white hover:border-[#4F46E5] hover:text-[#4F46E5] transition disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            上一页
          </button>
          {renderPageButtons()}
          <button
            className="px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-white hover:border-[#4F46E5] hover:text-[#4F46E5] transition disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            下一页
          </button>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-sm text-[#6B7280] hover:bg-white hover:border-[#4F46E5] hover:text-[#4F46E5] transition disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            title="末页"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-xs text-[#9CA3AF]">跳至</span>
            <input
              type="text"
              value={jumpInput}
              onChange={e => setJumpInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleJump() }}
              placeholder=""
              className="w-12 h-9 text-center text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
            />
            <button
              onClick={handleJump}
              className="h-9 px-2.5 text-xs font-medium text-[#4F46E5] border border-[#E5E7EB] rounded-lg hover:bg-[#EEF2FF] hover:border-[#4F46E5] transition"
            >
              GO
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
