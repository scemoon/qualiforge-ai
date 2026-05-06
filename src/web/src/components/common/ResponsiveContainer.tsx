/**
 * ResponsiveContainer - 统一移动端/平板适配容器
 * 使用: <ResponsiveContainer>内容</ResponsiveContainer>
 * 
 * 响应式断点:
 * - 默认(桌面): max-w-6xl, px-6
 * - md (平板 768px): max-w-5xl, px-4
 * - sm (大手机 640px): max-w-full, px-4
 * - xs (小手机 375px): px-3
 */
export default function ResponsiveContainer({ 
  children, 
  className = '',
  paddingX = 'px-4 md:px-6 lg:px-8',
  maxWidth = 'max-w-6xl lg:max-w-7xl',
}: { 
  children: React.ReactNode
  className?: string
  paddingX?: string
  maxWidth?: string
}) {
  return (
    <div className={`mx-auto ${maxWidth} w-full ${paddingX} ${className}`}>
      {children}
    </div>
  )
}

/**
 * 响应式文本大小
 */
export function ResponsiveHeading({ 
  children, 
  className = '',
  size = 'text-3xl md:text-4xl'
}: { 
  children: React.ReactNode
  className?: string
  size?: string
}) {
  return <h1 className={`${size} font-bold text-[#111827] ${className}`}>{children}</h1>
}

/**
 * 响应式卡片网格
 * cols: 桌面列数, mdCols: 平板列数, smCols: 手机列数
 */
export function ResponsiveGrid({ 
  children, 
  cols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  gap = 'gap-4 md:gap-6',
  className = ''
}: {
  children: React.ReactNode
  cols?: string
  gap?: string
  className?: string
}) {
  return <div className={`grid ${cols} ${gap} ${className}`}>{children}</div>
}

/**
 * 响应式 Flex 行
 */
export function ResponsiveFlex({ 
  children, 
  className = '',
  direction = 'flex-col sm:flex-row',
  gap = 'gap-2 sm:gap-4',
  align = 'items-center',
  justify = 'justify-between'
}: {
  children: React.ReactNode
  className?: string
  direction?: string
  gap?: string
  align?: string
  justify?: string
}) {
  return <div className={`flex ${direction} ${gap} ${align} ${justify} ${className}`}>{children}</div>
}