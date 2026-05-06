// 全宽布局：无侧边栏，用于文章编辑/新建等全屏场景
export default function StandaloneLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {children}
    </div>
  )
}
