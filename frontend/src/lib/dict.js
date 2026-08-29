import terms from '../data/terms.json'
import categories from '../data/categories.json'

export const TERMS = terms
export const CATEGORIES = categories

export const LANGS = ['en', 'zh', 'ja']
export const LANG_LABEL = { en: 'EN', zh: '中文', ja: '日本語' }

/** 从 {en,zh,ja} 里取当前语言，取不到就依次回退，永远不返回 undefined */
export function t(obj, lang) {
  if (obj == null) return ''
  if (typeof obj === 'string') return obj
  return obj[lang] || obj.en || obj.zh || obj.ja || ''
}

export function getTerm(id) {
  return TERMS.find((x) => x.id === id) || null
}

export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) || null
}

export function termsByCategory(catId) {
  return TERMS.filter((x) => x.category === catId)
}

/** 敏感度过滤：家长模式下只留 safe */
export function filterBySafeMode(list, safeMode) {
  if (!safeMode) return list
  return list.filter((x) => (x.sensitivity || 'safe') === 'safe')
}

// ---------------------------------------------------------------------------
// 词典索引 —— Decode 的核心
// ---------------------------------------------------------------------------

function normalize(s) {
  return String(s).normalize('NFKC').toLowerCase().trim()
}

const LATIN_RE = /^[a-z0-9][a-z0-9\s'\-.]*$/
const WORD_CHAR_RE = /[a-z0-9]/i

/**
 * 建立 「写法 -> 词条 id」 的索引。
 * term 本身和所有 aliases 都会进索引，所以 草 / w / wwww / 2333 都能命中同一条。
 */
export function buildIndex(list = TERMS) {
  const index = new Map()
  let maxLen = 1

  for (const item of list) {
    const keys = [item.term, ...(item.aliases || [])]
    for (const raw of keys) {
      const key = normalize(raw)
      if (!key) continue
      // 先进先得：靠前的词条优先，避免同一写法被后面的条目覆盖
      if (!index.has(key)) index.set(key, item.id)
      if (key.length > maxLen) maxLen = key.length
    }
  }

  return { index, maxLen }
}

function isLatinKey(key) {
  return LATIN_RE.test(key)
}

/** 拉丁字母的词要求词边界，否则 "w" 会在 "wow" 里面乱命中 */
function boundaryOk(text, start, end) {
  const before = start > 0 ? text[start - 1] : ''
  const after = end < text.length ? text[end] : ''
  if (before && WORD_CHAR_RE.test(before)) return false
  if (after && WORD_CHAR_RE.test(after)) return false
  return true
}

/**
 * 最长匹配分词：从左到右扫，每个位置尝试尽可能长的词。
 * 中日文没有空格，所以不能按空格切；这个扫描同时兼顾 CJK 和拉丁写法。
 * 返回 [{ start, end, id, surface }]，按出现顺序，不重叠。
 */
export function matchTerms(text, built = buildIndex()) {
  const { index, maxLen } = built
  const src = String(text || '')
  const lower = normalize(src)
  // normalize 可能改变长度（全角->半角等），长度不一致时退回原串保证下标对齐
  const scan = lower.length === src.length ? lower : src.toLowerCase()

  const out = []
  let i = 0
  while (i < scan.length) {
    let hit = null
    const maxHere = Math.min(maxLen, scan.length - i)
    for (let len = maxHere; len >= 1; len--) {
      const key = scan.slice(i, i + len)
      if (!index.has(key)) continue
      if (isLatinKey(key) && !boundaryOk(scan, i, i + len)) continue
      hit = { start: i, end: i + len, id: index.get(key), surface: src.slice(i, i + len) }
      break
    }
    if (hit) {
      out.push(hit)
      i = hit.end
    } else {
      i++
    }
  }
  return out
}

/**
 * 把整段文本切成可渲染的片段，并给每个命中的词编号（同一个词多次出现共用一个编号）。
 * 返回 { pieces, notes }
 *   pieces: [{ type:'text'|'hit', text, id?, n? }]
 *   notes:  [{ n, id, term }]  —— 下方译注列表用
 */
export function decodeLocal(text, built = buildIndex()) {
  const matches = matchTerms(text, built)
  const pieces = []
  const notes = []
  const seen = new Map()
  let cursor = 0

  for (const m of matches) {
    if (m.start > cursor) {
      pieces.push({ type: 'text', text: text.slice(cursor, m.start) })
    }
    let n = seen.get(m.id)
    if (!n) {
      n = seen.size + 1
      seen.set(m.id, n)
      notes.push({ n, id: m.id, term: getTerm(m.id) })
    }
    pieces.push({ type: 'hit', text: m.surface, id: m.id, n })
    cursor = m.end
  }
  if (cursor < text.length) {
    pieces.push({ type: 'text', text: text.slice(cursor) })
  }

  return { pieces, notes }
}

/** 已知词表：发给后端，让 LLM 只处理它不认识的部分 */
export function knownSurfaces(list = TERMS) {
  const out = []
  for (const item of list) {
    out.push(item.term)
    for (const a of item.aliases || []) out.push(a)
  }
  return out
}
