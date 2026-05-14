import { API_BASE, ENDPOINTS } from '@/config/api'
export { ENDPOINTS }
import { message } from 'tdesign-react'
import { useAuthStore } from '@/store/authStore'

export interface ApiRequestOptions {
  action: string
  data?: Record<string, any>
  endpoint?: keyof typeof ENDPOINTS
  onError?: (err: Error) => void
}

export async function apiRequest<T = any>({
  action,
  data = {},
  endpoint = 'articleCrud',
  onError,
}: ApiRequestOptions): Promise<T> {
  const token = useAuthStore.getState().token
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    let bodyData = { action, data }
    if (token) {
      bodyData = { action, data: { ...data, token } }
    }
    const res = await fetch(`${API_BASE}/${ENDPOINTS[endpoint]}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyData),
    })
    const result = await res.json()
    if (result.code !== 0) {
      const err = new Error(result.message || `API error: ${result.code}`)
      onError?.(err)
      throw err
    }
    return result as T
  } catch (err: any) {
    if (err.message && !err.message.includes('API error')) {
      onError?.(err)
    }
    throw err
  }
}

export function showError(msg: string) {
  message.error(msg)
}

export function showSuccess(msg: string) {
  message.success(msg)
}

export function showWarning(msg: string) {
  message.warning(msg)
}