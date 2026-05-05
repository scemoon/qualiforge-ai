import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [form, setForm] = useState({ email: '', nickname: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 8) {
      setError('密码长度至少 8 位')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', data: form }),
      })
      const data = await res.json()
      if (data.code !== 0) {
        setError(data.message || '注册失败')
        return
      }
      // Auto login after register
      const loginRes = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', data: { email: form.email, password: form.password } }),
      })
      const loginData = await loginRes.json()
      if (loginData.code === 0) {
        login(loginData.data.user, loginData.data.token)
      }
      navigate('/')
    } catch (err: any) {
      setError(err.message || '网络错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg border border-[#E5E7EB] p-8">
        <h1 className="text-2xl font-bold text-[#111827] mb-6 text-center">注册专家账号</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#4B5563] mb-1">邮箱</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-sm"
              placeholder="your@email.com"
              required
            />
          </div>
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
          {error && <p className="text-sm text-[#EF4444]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#4F46E5] text-white rounded-md hover:bg-[#4338CA] transition text-sm font-medium disabled:opacity-50"
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[#4B5563]">
          已有账号？<Link to="/login" className="text-[#4F46E5] hover:underline">直接登录</Link>
        </p>
      </div>
    </div>
  )
}