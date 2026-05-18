import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock CloudBase auth
vi.mock('@/lib/api-client', () => ({
  apiRequest: vi.fn(() => Promise.resolve({ data: null })),
}))

// Mock useAuthStore
vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(() => ({
    isAuthenticated: false,
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
  })),
}))

// Mock router
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
}))

// Mock dayjs
vi.mock('dayjs', () => ({
  default: vi.fn(() => ({
    format: vi.fn(() => '2024-01-01'),
    fromNow: vi.fn(() => '1 day ago'),
  })),
}))