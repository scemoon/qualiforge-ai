import { useState, useEffect } from 'react'
import ResponsiveContainer from '../../components/common/ResponsiveContainer'

const API_BASE = 'https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com'
const STORAGE_KEY = 'user_wx_config'

interface WxForm {
  appId: string
  name: string
  qrCode: string
  shareCode: string
}

async function fetchUser(userId: string) {
  const res = await fetch(`${API_BASE}/user-crud`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get', data: { userId } }),
  })
  return res.json()
}

async function updateUserWxConfig(userId: string, wxConfig: WxForm) {
  const res = await fetch(`${API_BASE}/user-crud`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update', data: { userId, wxOfficialAccount: wxConfig } }),
  })
  return res.json()
}

function getCurrentUserId(): string | null {
  try {
    const raw = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user')
    if (raw) {
      const user = JSON.parse(raw)
      return user._id || user.userId || null
    }
  } catch {}
  return null
}

export default function AdminWxConfig() {
  const [wxForm, setWxForm] = useState<WxForm>({ appId: '', name: '', qrCode: '', shareCode: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      // Try to load from API first
      const userId = getCurrentUserId()
      if (userId) {
        try {
          const res = await fetchUser(userId)
          if (res?.data?.wxOfficialAccount) {
            const wx = res.data.wxOfficialAccount
            setWxForm({
              appId: wx.appId || '',
              name: wx.name || '',
              qrCode: wx.qrCode || '',
              shareCode: wx.shareCode || '',
            })
            setLoading(false)
            return
          }
        } catch {}
      }
      // Fallback to localStorage
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
        if (saved && typeof saved === 'object') {
          setWxForm({
            appId: saved.appId || '',
            name: saved.name || '',
            qrCode: saved.qrCode || '',
            shareCode: saved.shareCode || '',
          })
        }
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setError('')
    setSaved(false)
    const userId = getCurrentUserId()
    if (userId) {
      try {
        setSaving(true)
        await updateUserWxConfig(userId, wxForm)
        setSaved(true)
      } catch (e) {
        setError('保存失败，请重试')
      } finally {
        setSaving(false)
      }
    } else {
      // Fallback: save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wxForm))
        setSaved(true)
      } catch {
        setError('保存失败')
      }
    }
  }

  if (loading) {
    return (
      <ResponsiveContainer className="py-6 md:py-8">
        <div className="text-center py-12 text-[#9CA3AF]">加载中...</div>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer className="py-6 md:py-8">
      <div className="max-w-xl">
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827] mb-1">公众号投放配置</h1>
        <p className="text-sm text-[#9CA3AF] mb-6">配置当前管理员账号的公众号信息，用于文章分享和JSSDK签名。</p>

        <div className="bg-white rounded-lg border border-[#E5E7EB] p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#374151] mb-1 block">公众号 AppID</label>
              <input
                value={wxForm.appId}
                onChange={e => setWxForm({ ...wxForm, appId: e.target.value })}
                placeholder="wx...（用于JSSDK签名）"
                className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#374151] mb-1 block">公众号名称</label>
              <input
                value={wxForm.name}
                onChange={e => setWxForm({ ...wxForm, name: e.target.value })}
                placeholder="QualiForge AI"
                className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#374151] mb-1 block">二维码图片 URL</label>
              <input
                value={wxForm.qrCode}
                onChange={e => setWxForm({ ...wxForm, qrCode: e.target.value })}
                placeholder="https://...（公众号二维码图片地址）"
                className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#374151] mb-1 block">分享暗号</label>
              <input
                value={wxForm.shareCode}
                onChange={e => setWxForm({ ...wxForm, shareCode: e.target.value })}
                placeholder="article2026（用户回复此暗号获取阅读权限）"
                className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
              />
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-[#EF4444]">{error}</p>}
          {saved && <p className="mt-3 text-sm text-[#10B981]">保存成功 ✅</p>}

          <div className="mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-[#4F46E5] text-white rounded-md text-sm font-medium hover:bg-[#4338CA] disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存配置'}
            </button>
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  )
}
