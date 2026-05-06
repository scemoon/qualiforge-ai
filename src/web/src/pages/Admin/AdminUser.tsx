import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import ResponsiveContainer from '../../components/common/ResponsiveContainer'

async function fetchUsers({ page = 1, role }: { page?: number; role?: string }) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/user-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list', data: { page, pageSize: 20, role } }),
  })
  return res.json()
}

async function toggleUser(userId: string, enabled: boolean) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/user-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update', data: { userId, enabled: !enabled } }),
  })
  return res.json()
}

const roleTag = (r: string) => {
  const map: Record<string, string> = {
    admin: 'bg-[#EF4444] text-white', expert: 'bg-[#4F46E5] text-white', visitor: 'bg-[#9CA3AF] text-white',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs ${map[r] || 'bg-gray-200'}`}>{r}</span>
}

export default function AdminUser() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, roleFilter],
    queryFn: () => fetchUsers({ page, role: roleFilter || undefined }),
  })

  const toggleMut = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => toggleUser(id, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const users = data?.data?.list || []
  const total = data?.data?.total || 0

  return (
    <ResponsiveContainer className="py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">用户管理</h1>
        <select
          className="border border-[#E5E7EB] rounded-md px-3 py-1.5 text-sm w-full sm:w-auto"
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
        >
          <option value="">全部角色</option>
          <option value="admin">管理员</option>
          <option value="expert">专家</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#9CA3AF]">加载中...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3AF]">暂无用户</div>
      ) : (
        <>
          {/* Desktop: Table */}
          <div className="hidden md:block bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th className="text-left px-4 py-3 text-[#4B5563] font-medium">昵称</th>
                  <th className="text-left px-4 py-3 text-[#4B5563] font-medium">邮箱</th>
                  <th className="text-center px-4 py-3 text-[#4B5563] font-medium">角色</th>
                  <th className="text-center px-4 py-3 text-[#4B5563] font-medium">状态</th>
                  <th className="text-center px-4 py-3 text-[#4B5563] font-medium">注册时间</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u._id} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#111827]">{u.nickname || '-'}</div>
                      <div className="text-xs text-[#9CA3AF] font-mono hidden lg:block">{u._id}</div>
                    </td>
                    <td className="px-4 py-3 text-[#4B5563] text-sm">{u.email || '-'}</td>
                    <td className="text-center px-4 py-3">{roleTag(u.role)}</td>
                    <td className="text-center px-4 py-3">
                      <button
                        onClick={() => toggleMut.mutate({ id: u._id, enabled: u.enabled })}
                        className={`px-2 py-0.5 rounded-full text-xs ${u.enabled ? 'bg-[#10B981] text-white' : 'bg-[#EF4444] text-white'}`}
                      >
                        {u.enabled ? '正常' : '禁用'}
                      </button>
                    </td>
                    <td className="text-center px-4 py-3 text-[#9CA3AF] text-xs">
                      {u.createdAt ? dayjs(u.createdAt).format('YYYY-MM-DD') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: Cards */}
          <div className="md:hidden space-y-3">
            {users.map((u: any) => (
              <div key={u._id} className="bg-white rounded-lg border border-[#E5E7EB] p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-[#111827]">{u.nickname || '-'}</div>
                    <div className="text-xs text-[#9CA3AF]">{u.email || '-'}</div>
                  </div>
                  {roleTag(u.role)}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F3F4F6]">
                  <span className="text-xs text-[#9CA3AF]">
                    {u.createdAt ? dayjs(u.createdAt).format('YYYY-MM-DD') : '-'}
                  </span>
                  <button
                    onClick={() => toggleMut.mutate({ id: u._id, enabled: u.enabled })}
                    className={`px-2 py-0.5 rounded-full text-xs ${u.enabled ? 'bg-[#10B981] text-white' : 'bg-[#EF4444] text-white'}`}
                  >
                    {u.enabled ? '正常' : '禁用'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="mt-4 md:mt-6 flex flex-wrap justify-center gap-2">
          <button
            className="px-4 py-2 border border-[#E5E7EB] rounded-md text-sm hover:bg-[#F9FAFB]"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            上一页
          </button>
          <span className="px-4 py-2 text-sm text-[#4B5563]">{page} / {Math.ceil(total / 20)}</span>
          <button
            className="px-4 py-2 border border-[#E5E7EB] rounded-md text-sm hover:bg-[#F9FAFB]"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / 20)}
          >
            下一页
          </button>
        </div>
      )}
    </ResponsiveContainer>
  )
}