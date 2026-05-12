import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('https://cloud1-2gavd8kj8a1ce021.service.tcloudbase.com/api/forge/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', data: { email, password } }),
      })
      const data = await res.json()
      if (data.code !== 0) {
        setError(data.message || '登录失败')
        return
      }
      login(data.data.user, data.data.token)
      navigate('/')
    } catch (err: any) {
      setError(err.message || '网络错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 sm:px-6 py-6">
      <div className="w-full max-w-md bg-white rounded-lg border border-[#E5E7EB] p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-[#111827] mb-6 text-center">登录</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#4B5563] mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-sm"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4B5563] mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-sm"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-sm text-[#EF4444]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#4F46E5] text-white rounded-md hover:bg-[#4338CA] transition text-sm font-medium disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-[#4B5563]">
          还没有账号？<Link to="/register" className="text-[#4F46E5] hover:underline">注册专家</Link>
        </p>
      </div>
    </div>
  )
}