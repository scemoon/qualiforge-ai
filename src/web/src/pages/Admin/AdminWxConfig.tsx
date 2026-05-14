import { useState, useEffect } from 'react'
import { message } from 'tdesign-react'
import ResponsiveContainer from '../../components/common/ResponsiveContainer'
import { apiRequest } from '../../lib/api-client'

const STORAGE_KEY = 'user_wx_config'

interface WxForm {
  appId: string
  name: string
  qrCode: string
  shareCode: string
}

async function fetchUser(userId: string) {
  return apiRequest({ action: 'get', data: { userId }, endpoint: 'userCrud' })
}

async function updateUserWxConfig(userId: string, wxConfig: WxForm) {
  return apiRequest({ action: 'update', data: { userId, wxOfficialAccount: wxConfig }, endpoint: 'userCrud' })
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

  useEffect(() => {
    const load = async () => {
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
    const userId = getCurrentUserId()
    if (userId) {
      try {
        setSaving(true)
        await updateUserWxConfig(userId, wxForm)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wxForm))
        message.success('保存成功')
      } catch (e) {
        message.error('保存失败，请重试')
      } finally {
        setSaving(false)
      }
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wxForm))
        message.success('保存成功')
      } catch {
        message.error('保存失败')
      }
    }
  }

  if (loading) {
    return (
      <ResponsiveContainer className="py-8 md:py-10">
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-[#9CA3AF]">
            <div className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
            <span>加载中...</span>
          </div>
        </div>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer className="py-8 md:py-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#111827]">公众号配置</h1>
        <p className="text-[#6B7280] mt-1 text-sm">配置公众号信息用于文章分享和 JSSDK 签名</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[#111827]">微信公众号</p>
              <p className="text-xs text-[#6B7280]">用于小程序文章分享和微信内访问</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-2">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  AppID
                </span>
              </label>
              <input
                value={wxForm.appId}
                onChange={e => setWxForm({ ...wxForm, appId: e.target.value })}
                placeholder="wx...（用于 JSSDK 签名）"
                className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
              />
              <p className="text-xs text-[#9CA3AF] mt-1.5">在微信公众平台获取的 AppID</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-2">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  公众号名称
                </span>
              </label>
              <input
                value={wxForm.name}
                onChange={e => setWxForm({ ...wxForm, name: e.target.value })}
                placeholder="QualiForge AI"
                className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-2">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  二维码图片
                </span>
              </label>
              <input
                value={wxForm.qrCode}
                onChange={e => setWxForm({ ...wxForm, qrCode: e.target.value })}
                placeholder="https://...（公众号二维码图片地址）"
                className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
              />
              {wxForm.qrCode && (
                <div className="mt-3 rounded-xl overflow-hidden border border-[#E5E7EB] max-w-xs">
                  <img
                    src={wxForm.qrCode}
                    alt="二维码预览"
                    className="w-full h-48 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-2">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#4F46E5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  分享暗号
                </span>
              </label>
              <input
                value={wxForm.shareCode}
                onChange={e => setWxForm({ ...wxForm, shareCode: e.target.value })}
                placeholder="article2026（用户回复此暗号获取阅读权限）"
                className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
              />
              <p className="text-xs text-[#9CA3AF] mt-1.5">用户发送此暗号到公众号获取文章阅读权限</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-xl text-sm font-semibold hover:from-[#4338CA] hover:to-[#6D28D9] transition shadow-lg shadow-indigo-500/20 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>保存中...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>保存配置</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  )
}