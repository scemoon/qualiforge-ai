import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

type RegisterMode = 'password' | 'code'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [mode, setMode] = useState<RegisterMode>('code')
  const [form, setForm] = useState({ email: '', nickname: '', password: '', code: '' })
  const [codeCountdown, setCodeCountdown] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // 发送验证码
  async function handleSendCode() {
    if (!form.email) { setError('请输入邮箱'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('无效的邮箱格式'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('https://cloud1-2gavd8kj8a1ce021.service.tcloudbase.com/forge/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sendRegisterCode', data: { email: form.email } }),
      })
      const data = await res.json()
      if (data.code !== 0) { setError(data.message || '发送失败'); return }
      // 演示模式下后端返回了 code，实际发邮件时去掉
      if (data.data?.code) {
        setError(`[演示] 验证码: ${data.data.code}`) // TODO: 实际环境移除这行
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
        const res = await fetch('https://cloud1-2gavd8kj8a1ce021.service.tcloudbase.com/forge/auth', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'registerWithCode', data: form }),
        })
        const data = await res.json()
        if (data.code !== 0) { setError(data.message || '注册失败'); setLoading(false); return }
        login(data.data.user, data.data.token)
        navigate('/forge/')
      } else {
        if (form.password.length < 8) { setError('密码长度至少 8 位'); setLoading(false); return }
        const res = await fetch('https://cloud1-2gavd8kj8a1ce021.service.tcloudbase.com/forge/auth', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'register', data: form }),
        })
        const data = await res.json()
        if (data.code !== 0) { setError(data.message || '注册失败'); setLoading(false); return }
        // Auto login
        const loginRes = await fetch('https://cloud1-2gavd8kj8a1ce021.service.tcloudbase.com/forge/auth', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', data: { email: form.email, password: form.password } }),
        })
        const loginData = await loginRes.json()
        if (loginData.code === 0) login(loginData.data.user, loginData.data.token)
        navigate('/forge/')
      }
    } catch (err: any) {
      setError(err.message || '网络错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 sm:px-6 py-6">
      <div className="w-full max-w-md bg-white rounded-lg border border-[#E5E7EB] p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-[#111827] mb-6 text-center">注册专家账号</h1>

        {/* Mode tabs */}
        <div className="flex gap-1 mb-5 bg-[#F3F4F6] rounded-lg p-1">
          <button
            onClick={() => setMode('code')}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition ${mode === 'code' ? 'bg-white text-[#4F46E5] shadow' : 'text-[#6B7280] hover:text-[#111827]'}`}
          >
            验证码注册
          </button>
          <button
            onClick={() => setMode('password')}
            className={`flex-1 py-1.5 rounded-md text-sm font-medium transition ${mode === 'password' ? 'bg-white text-[#4F46E5] shadow' : 'text-[#6B7280] hover:text-[#111827]'}`}
          >
            密码注册
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#4B5563] mb-1">邮箱</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="flex-1 border border-[#E5E7EB] rounded-md px-3 py-2 text-sm"
                placeholder="your@email.com"
                required
              />
              {mode === 'code' && (
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={codeCountdown > 0 || loading}
                  className="px-3 py-2 border border-[#4F46E5] text-[#4F46E5] rounded-md text-sm hover:bg-[#F5F3FF] transition disabled:opacity-50 whitespace-nowrap"
                >
                  {codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码'}
                </button>
              )}
            </div>
          </div>

          {/* Code (code mode only) */}
          {mode === 'code' && (
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-1">验证码</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-sm tracking-widest text-center letter-spacing-widest"
                placeholder="6 位验证码"
                maxLength={6}
                required
              />
            </div>
          )}

          {/* Nickname */}
          <div>
            <label className="block text-sm font-medium text-[#4B5563] mb-1">昵称</label>
            <input
              type="text"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-sm"
              placeholder="你的昵称"
              required
            />
          </div>

          {/* Password (password mode only) */}
          {mode === 'password' && (
            <div>
              <label className="block text-sm font-medium text-[#4B5563] mb-1">密码</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-sm"
                placeholder="至少 8 位"
                minLength={8}
                required
              />
            </div>
          )}

          {error && (
            <p className={`text-sm ${error.includes('演示') ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#4F46E5] text-white rounded-md hover:bg-[#4338CA] transition text-sm font-medium disabled:opacity-50"
          >
            {loading ? '处理中...' : '注册'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[#4B5563]">
          已有账号？<Link to="/forge/login" className="text-[#4F46E5] hover:underline">直接登录</Link>
        </p>
      </div>
    </div>
  )
}