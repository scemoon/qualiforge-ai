import { Loading } from 'tdesign-react'

interface LoadingStateProps {
  text?: string
  size?: 'small' | 'medium' | 'large'
  fullScreen?: boolean
}

export default function LoadingState({
  text = '加载中...',
  size = 'medium',
  fullScreen = false,
}: LoadingStateProps) {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <Loading size="large" content={text} />
      </div>
    )
  }
  return (
    <div className="flex items-center justify-center py-12">
      <Loading size={size} content={text} />
    </div>
  )
}

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = '加载失败', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-[#EF4444] text-sm mb-2">{message}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-[#4F46E5] hover:underline"
        >
          重试
        </button>
      )}
    </div>
  )
}

interface EmptyStateProps {
  text?: string
}

export function EmptyState({ text = '暂无数据' }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-12 text-[#9CA3AF] text-sm">
      {text}
    </div>
  )
}