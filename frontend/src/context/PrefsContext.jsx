import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const PrefsContext = createContext(null)

const KEY = 'tlnote-prefs'

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* 隐私模式下 localStorage 会抛错，忽略即可 */
  }
  return {}
}

export function PrefsProvider({ children }) {
  const saved = load()
  const [lang, setLang] = useState(saved.lang || 'en')
  const [level, setLevel] = useState(saved.level || 'simple')
  const [safeMode, setSafeMode] = useState(saved.safeMode ?? false)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ lang, level, safeMode }))
    } catch {
      /* 同上 */
    }
    document.documentElement.lang = lang
  }, [lang, level, safeMode])

  const value = useMemo(
    () => ({ lang, setLang, level, setLevel, safeMode, setSafeMode }),
    [lang, level, safeMode]
  )

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
}

export function usePrefs() {
  const ctx = useContext(PrefsContext)
  if (!ctx) throw new Error('usePrefs must be used inside <PrefsProvider>')
  return ctx
}

/** 界面文案的三语表。加新文案就往这里加一行。 */
export const UI = {
  tagline: {
    en: 'Machine translation gives you the word. TL Note gives you what the word means to the people using it.',
    zh: '机器翻译给你这个词。TL Note 给你这个词对使用它的人意味着什么。',
    ja: '機械翻訳は言葉を返す。TL Note は、その言葉が使う人にとって何を意味するかを返す。',
  },
  searchPlaceholder: {
    en: 'Search a term — try 草, oshi, 太太, landmine…',
    zh: '搜一个词——试试 草、推し、太太、地雷……',
    ja: '用語を検索——草、推し、太太、地雷 など',
  },
  decodeCta: { en: 'Decode a whole message', zh: '解码一整段话', ja: 'まとめて解読する' },
  decodeTitle: { en: 'Decode', zh: '整句解码', ja: '解読' },
  decodeLead: {
    en: "Paste a comment, a post or a chat message. We'll highlight every term we know and explain it below.",
    zh: '把评论、动态或聊天记录贴进来。我们会标出所有认识的术语，并在下面逐条解释。',
    ja: 'コメントや投稿を貼り付けてください。既知の用語を強調し、下に解説します。',
  },
  decodeButton: { en: 'Decode', zh: '开始解码', ja: '解読する' },
  askAI: { en: 'Ask AI about unknown words', zh: '让 AI 处理未收录的词', ja: '未収録語をAIに聞く' },
  trending: { en: 'Machine translation traps', zh: '机翻陷阱词', ja: '機械翻訳の罠' },
  browse: { en: 'Browse by category', zh: '按分类浏览', ja: 'カテゴリ別に見る' },
  machineSays: { en: 'Machine translation says', zh: '机器翻译会告诉你', ja: '機械翻訳の答え' },
  actually: { en: 'What it actually means', zh: '实际意思', ja: '実際の意味' },
  explanation: { en: 'Explanation', zh: '解释', ja: '解説' },
  example: { en: 'Example in the wild', zh: '真实用例', ja: '実際の用例' },
  crossCulture: { en: 'Cross-cultural comparison', zh: '跨文化对比', ja: '文化間の比較' },
  related: { en: 'Related terms', zh: '相关词条', ja: '関連語' },
  sources: { en: 'Sources', zh: '来源', ja: '出典' },
  simple: { en: 'Simple', zh: '简明', ja: 'やさしく' },
  full: { en: 'Full', zh: '详细', ja: 'くわしく' },
  safeMode: { en: 'Family mode', zh: '家长模式', ja: 'ファミリーモード' },
  safeModeHint: {
    en: 'Hides terms that need adult context.',
    zh: '隐藏需要成人语境的词条。',
    ja: '成人向けの文脈が必要な語を隠します。',
  },
  noResults: { en: 'No entry yet for', zh: '还没有收录', ja: 'まだ収録されていません：' },
  draftIt: { en: 'Let AI draft an entry', zh: '让 AI 起草一条', ja: 'AIに下書きさせる' },
  aiDraft: { en: 'AI draft — not reviewed by a human', zh: 'AI 草稿——尚未经人工审核', ja: 'AI下書き——未査読' },
  terms: { en: 'terms', zh: '条词条', ja: '語' },
  back: { en: 'All categories', zh: '返回全部分类', ja: 'カテゴリ一覧へ' },
}

export function ui(key, lang) {
  const row = UI[key]
  if (!row) return key
  return row[lang] || row.en
}
