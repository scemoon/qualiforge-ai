import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Home from '@/pages/Home'

// Mock components
vi.mock('@/components/business/SectionBlock', () => ({
  default: () => <div data-testid="section-block">SectionBlock</div>
}))

vi.mock('@/components/common/ResponsiveContainer', () => ({
  default: ({ children }: any) => <div className="responsive-container">{children}</div>,
  ResponsiveContainer: ({ children }: any) => <div className="responsive-container">{children}</div>
}))

vi.mock('@/components/common/LoadingState', () => ({
  default: () => <div data-testid="loading-state">Loading...</div>
}))

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
  })

  it('displays hero banner', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
    expect(screen.getByText(/Forge.*AI/)).toBeDefined()
  })
})