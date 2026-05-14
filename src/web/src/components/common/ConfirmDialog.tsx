import { createPortal } from 'react-dom'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isDanger?: boolean
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  isDanger = false,
}: ConfirmDialogProps) {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5">
          <h3 className="text-lg font-bold text-[#111827]">{title}</h3>
          <p className="text-sm text-[#6B7280] mt-2">{message}</p>
        </div>
        <div className="flex border-t border-[#E5E7EB]">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3.5 text-sm font-medium text-[#6B7280] hover:bg-[#F9FAFB] transition border-r border-[#E5E7EB]"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3.5 text-sm font-semibold transition ${
              isDanger
                ? 'text-red-600 hover:bg-red-50'
                : 'text-[#4F46E5] hover:bg-indigo-50'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export function showConfirmDialog(options: {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  isDanger?: boolean
}) {
  const {
    title = '确认操作',
    message,
    confirmText = '确认',
    cancelText = '取消',
    onConfirm = () => {},
    onCancel = () => {},
    isDanger = false,
  } = options

  const container = document.createElement('div')
  document.body.appendChild(container)

  const handleConfirm = () => {
    onConfirm?.()
    cleanup()
  }

  const handleCancel = () => {
    onCancel?.()
    cleanup()
  }

  const cleanup = () => {
    import('react-dom').then(({ unmountComponentAtNode }) => {
      unmountComponentAtNode(container)
      container.remove()
    })
  }

  import('react-dom').then(({ createPortal: cp, render }) => {
    const portalElement = cp(
      <ConfirmDialog
        open={true}
        title={title}
        message={message}
        confirmText={confirmText}
        cancelText={cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isDanger={isDanger}
      />,
      container
    )
    render(portalElement as any, container)
  })
}