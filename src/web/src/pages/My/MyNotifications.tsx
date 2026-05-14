import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import ResponsiveContainer from '../../components/common/ResponsiveContainer'
import { apiRequest } from '../../lib/api-client'

async function fetchNotifications() {
  return apiRequest({ action: 'list', data: { page: 1, pageSize: 50 }, endpoint: 'notificationCrud' })
}

async function markOneRead(notificationId: string) {
  return apiRequest({ action: 'markRead', data: { notificationId }, endpoint: 'notificationCrud' })
}

async function markAllRead() {
  return apiRequest({ action: 'markAllRead', data: {}, endpoint: 'notificationCrud' })
}

const typeIcons: Record<string, { icon: string; color: string; bg: string }> = {
  system: { icon: '🔔', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  article: { icon: '📝', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  comment: { icon: '💬', color: 'text-amber-600', bg: 'bg-amber-50' },
  default: { icon: '📌', color: 'text-blue-600', bg: 'bg-blue-50' },
}

export default function MyNotifications() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['my-notifications'], queryFn: fetchNotifications })

  const markOneMut = useMutation({
    mutationFn: markOneRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-notifications'] }),
  })

  const markAllMut = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-notifications'] }),
  })

  const notifications = data?.data?.list || []
  const unreadCount = notifications.filter((n: any) => !n.read).length

  return (
    <ResponsiveContainer className="py-8 md:py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#111827]">通知中心</h1>
          <p className="text-[#6B7280] mt-1 text-sm">
            {unreadCount > 0 ? (
              <span className="text-[#EF4444] font-medium">{unreadCount} 条未读通知</span>
            ) : (
              '暂无未读通知'
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllMut.mutate()}
            disabled={markAllMut.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#EEF2FF] text-[#4F46E5] rounded-xl text-sm font-medium hover:bg-[#E0E7FF] transition disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>全部标为已读</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-[#9CA3AF]">
            <div className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
            <span>加载中...</span>
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center text-5xl mb-5">✅</div>
          <p className="text-lg font-medium text-[#111827]">暂无通知</p>
          <p className="text-sm text-[#9CA3AF] mt-1">所有消息都已处理完毕</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden divide-y divide-[#E5E7EB]">
          {notifications.map((n: any) => {
            const iconConfig = typeIcons[n.type] || typeIcons.default
            return (
              <div
                key={n._id}
                className={`p-4 md:p-5 transition-colors ${
                  n.read ? 'hover:bg-[#FAFAFA]' : 'bg-indigo-50/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${iconConfig.bg} flex items-center justify-center text-lg flex-shrink-0`}>
                    {iconConfig.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-semibold ${n.read ? 'text-[#4B5563]' : 'text-[#111827]'}`}>
                          {n.title || '系统通知'}
                        </h3>
                        {n.content && (
                          <p className="text-sm text-[#6B7280] mt-1 line-clamp-2">{n.content}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            n.read ? 'bg-gray-100 text-[#9CA3AF]' : 'bg-indigo-100 text-[#4F46E5]'
                          }`}>
                            {n.read ? '已读' : '未读'}
                          </span>
                          <span className="text-xs text-[#9CA3AF]">
                            {dayjs(n.createdAt).format('YYYY-MM-DD HH:mm')}
                          </span>
                        </div>
                      </div>
                      {!n.read && (
                        <button
                          onClick={() => markOneMut.mutate(n._id)}
                          className="flex-shrink-0 px-3 py-1.5 text-xs text-[#4F46E5] hover:bg-indigo-100 rounded-lg transition font-medium"
                        >
                          标为已读
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </ResponsiveContainer>
  )
}