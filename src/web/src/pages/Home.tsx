import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import SectionBlock from '../components/business/SectionBlock'

// API endpoint
const API_BASE = 'https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com'

async function fetchSections() {
  try {
    const res = await fetch(`${API_BASE}/section-crud`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list' }),
    })
    return res.json()
  } catch (e) {
    console.error('fetchSections error:', e)
    return { data: { list: [] }, error: String(e) }
  }
}

export default function Home() {
  const { data, isLoading } = useQuery({
    queryKey: ['sections'],
    queryFn: fetchSections,
  })

  const sections = data?.data?.list || []
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="min-h-screen bg-[#F4F6F8]">
      {/* Hero + Login */}
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white">
        <div className="max-w-6xl mx-auto px-6 py-12 flex items-start justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              QualiForge <span className="text-indigo-400">AI</span>
            </h1>
            <p className="text-white/60 text-base max-w-xl">
              系统化评估、验证、提升 AI Coding 质量 — 让每一行 AI 生成代码都可信
            </p>
          </div>
          <a href="/login" className="flex-shrink-0 px-5 py-2.5 bg-white text-[#4F46E5] rounded-lg font-semibold text-sm hover:bg-indigo-50 transition">
            登录 / 注册
          </a>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-0">
            {sections.map((section: any, i: number) => (
              <button
                key={section._id}
                onClick={() => setActiveTab(i)}
                className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === i
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-[#6B7280]">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>加载中...</span>
            </div>
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#9CA3AF] text-lg">社区正在初始化</p>
          </div>
        ) : (
          <div>
            {sections[activeTab] && (
              <SectionBlock section={sections[activeTab]} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}