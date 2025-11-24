import { Platform } from 'react-native'

// Default host for dev (change if your backend uses a different host/port)
const DEFAULT_HOST = 'http://localhost:4000'

// Android emulator uses 10.0.2.2 to reach host machine
export const BACKEND_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : DEFAULT_HOST

// Helper to build full URLs for API calls
export const api = (path: string) => {
  if (!path) return BACKEND_BASE
  return path.startsWith('/') ? `${BACKEND_BASE}${path}` : `${BACKEND_BASE}/${path}`
}
