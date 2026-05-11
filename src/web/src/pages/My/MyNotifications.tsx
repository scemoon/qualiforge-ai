import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import ResponsiveContainer from '../../components/common/ResponsiveContainer'

async function fetchNotifications() {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/forge-notification-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'list', data: { page: 1, pageSize: 20 } }),
  })
  return res.json()
}

async function markOneRead(notificationId: string) {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/forge-notification-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'markRead', data: { notificationId } }),
  })
  return res.json()
}

async function markAllRead() {
  const res = await fetch('https://cloud1-2gavd8kj8a1ce021-1306178265.tcloudbaseapp.com/forge-notification-crud', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'markRead', data: {} }),
  })
  return res.json()
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

  return (
    <ResponsiveContainer className="py-6 md:py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111827]">通知中心</h1>
        <button
          onClick={() => markAllMut.mutate()}
          disabled={markAllMut.isPending}
          className="text-sm text-[#4F46E5] hover:underline disabled:opacity-50"
        >
          全部标为已读
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-[#9CA3AF]">加载中...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 text-[#9CA3AF]">暂无通知 ✅</div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n: any) => (
            <div
              key={n._id}
              className={`bg-white rounded-lg border p-4 ${n.read ? 'border-[#E5E7EB]' : 'border-[#4F46E5] bg-[#EEF2FF]'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={`text-sm font-medium ${n.read ? 'text-[#4B5563]' : 'text-[#111827]'}`}>{n.title}</p>
                  {n.content && <p className="text-sm text-[#4B5563] mt-1">{n.content}</p>}
                </div>
                {!n.read && (
                  <button
                    onClick={() => markOneMut.mutate(n._id)}
                    className="text-xs text-[#4F46E5] hover:underline whitespace-nowrap"
                  >
                    标为已读
                  </button>
                )}
              </div>
              <p className="text-xs text-[#9CA3AF] mt-2">{dayjs(n.createdAt).format('YYYY-MM-DD HH:mm')}</p>
            </div>
          ))}
        </div>
      )}
    </ResponsiveContainer>
  )
}