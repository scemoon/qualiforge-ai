import { Outlet } from 'react-router-dom'

export default function EvaluationLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}