/**
 * 后端只负责 LLM 那一小块。所有已收录词的匹配都在前端本地完成，
 * 所以后端挂了、断网了，Decode 和整个词典依然能完整演示。
 */

const BASE = import.meta.env.VITE_API_BASE || ''

async function post(path, body, timeoutMs = 20000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

/** 未收录词 → LLM 起草一条词条（返回的 status 一定是 ai-draft） */
export async function draftTerm(term, context = '') {
  return post('/api/draft', { term, context })
}

/** 整段文本里前端没认出来的部分 → LLM 找出可能的 ACG 术语并起草 */
export async function decodeUnknown(text, known = []) {
  return post('/api/decode', { text, known })
}
