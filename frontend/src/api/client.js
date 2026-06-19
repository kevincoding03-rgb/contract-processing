const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

async function request(url, options = {}) {
  const fetchOptions = { ...options }

  // FormData 时不要手动设置 headers，让浏览器自动设置 Content-Type + boundary
  if (!(options.body instanceof FormData)) {
    fetchOptions.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  }

  const res = await fetch(`${API_BASE}${url}`, fetchOptions)

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }))
    const msg = typeof error.detail === 'string'
      ? error.detail
      : JSON.stringify(error.detail)
    throw new Error(msg || `请求失败: ${res.status}`)
  }

  return res.json()
}

export async function analyzeFile(file, userId = 'anonymous') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('user_id', userId)

  return request('/api/analyze', {
    method: 'POST',
    body: formData,
  })
}

export async function chat(messages, context = '', userId = 'anonymous') {
  return request('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ messages, context, user_id: userId }),
  })
}

export async function getHistory(userId, limit = 20) {
  return request(`/api/history/${userId}?limit=${limit}`)
}

export async function getRecord(recordId) {
  return request(`/api/record/${recordId}`)
}

export async function healthCheck() {
  return request('/api/health')
}
