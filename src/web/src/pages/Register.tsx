import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { apiRequest } from '../lib/api-client'

type RegisterMode = 'code' | 'password'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [mode, setMode] = useState<RegisterMode>('code')
  const [form, setForm] = useState({ email: '', nickname: '', password: '', code: '' })
  const [codeCountdown, setCodeCountdown] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSendCode() {
    if (!form.email) { setError('请输入邮箱'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('无效的邮箱格式'); return }
    setError('')
    setLoading(true)
    try {
      const data = await apiRequest<{ code?: string }>({
        action: 'sendRegisterCode',
        data: { email: form.email },
        endpoint: 'auth',
      })
      if (data.code) {
        setError(`[演示] 验证码: ${data.code}`)
      }
      setCodeCountdown(60)
      const timer = setInterval(() => {
        setCodeCountdown(c => {
          if (c <= 1) { clearInterval(timer); return 0 }
          return c - 1
        })
      }, 1000)
    } catch (err: any) {
      setError(err.message || '网络错误')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'code') {
        if (!form.code || form.code.length !== 6) { setError('请输入 6 位验证码'); setLoading(false); return }
        const data = await apiRequest<{ user: any; token: string }>({
          action: 'registerWithCode',
          data: form,
          endpoint: 'auth',
        })
        login(data.user, data.token)
        navigate('/')
      } else {
        if (form.password.length < 8) { setError('密码长度至少 8 位'); setLoading(false); return }
        await apiRequest({
          action: 'register',
          data: form,
          endpoint: 'auth',
        })
        const loginData = await apiRequest<{ user: any; token: string }>({
          action: 'login',
          data: { email: form.email, password: form.password },
          endpoint: 'auth',
        })
        login(loginData.user, loginData.token)
        navigate('/')
      }
    } catch (err: any) {
      setError(err.message || '网络错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-8 md:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-indigo-500/30">
            ⚡
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#111827]">创建账号</h1>
          <p className="text-[#6B7280] mt-2">加入 QualiForge 专家社区</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 md:p-8 shadow-xl">
          <div className="flex gap-2 mb-6 bg-[#F3F4F6] p-1 rounded-xl">
            <button
              onClick={() => setMode('code')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'code'
                  ? 'bg-white text-[#4F46E5] shadow'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              验证码注册
            </button>
            <button
              onClick={() => setMode('password')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'password'
                  ? 'bg-white text-[#4F46E5] shadow'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              密码注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-2">邮箱</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="flex-1 border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                  placeholder="your@email.com"
                  required
                />
                {mode === 'code' && (
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={codeCountdown > 0 || loading}
                    className="px-4 py-3 border border-[#4F46E5] text-[#4F46E5] rounded-xl text-sm font-medium hover:bg-[#F5F3FF] transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码'}
                  </button>
                )}
              </div>
            </div>

            {mode === 'code' && (
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2">验证码</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm tracking-widest text-center letter-spacing-widest focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                  placeholder="6 位验证码"
                  maxLength={6}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[#374151] mb-2">昵称</label>
              <input
                type="text"
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                placeholder="您的昵称"
                required
              />
            </div>

            {mode === 'password' && (
              <div>
                <label className="block text-sm font-semibold text-[#374151] mb-2">密码</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition"
                  placeholder="至少 8 位"
                  minLength={8}
                  required
                />
              </div>
            )}

            {error && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${error.includes('演示') ? 'bg-emerald-50 border border-emerald-100 text-emerald-600' : 'bg-red-50 border border-red-100 text-red-600'}`}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#4F46E5] text-white rounded-xl font-semibold text-sm hover:bg-[#4338CA] transition shadow-lg shadow-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>处理中...</span>
                </>
              ) : (
                <span>注册</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#6B7280]">
              已有账号？
              <Link to="/login" className="text-[#4F46E5] font-semibold hover:underline ml-1">
                直接登录
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-[#9CA3AF] hover:text-[#4F46E5] transition inline-flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            <span>返回首页</span>
          </Link>
        </div>
      </div>
    </div>
  )
}