import Fuse from 'fuse.js'
import { TERMS } from './dict'

/**
 * 搜索要能命中：原词、别名、罗马音、三语的真实含义与简单解释、tag。
 * 用户可能输入 "kusa"、"草"、"w"、"grass"、"laughing"，都得能找到同一条。
 */
const fuse = new Fuse(TERMS, {
  includeScore: true,
  threshold: 0.38,
  ignoreLocation: true,
  minMatchCharLength: 1,
  keys: [
    { name: 'term', weight: 3 },
    { name: 'aliases', weight: 3 },
    { name: 'reading', weight: 2 },
    { name: 'machine_translation', weight: 1.5 },
    { name: 'real_meaning.en', weight: 1.5 },
    { name: 'real_meaning.zh', weight: 1.5 },
    { name: 'real_meaning.ja', weight: 1.5 },
    { name: 'explanation.simple.en', weight: 1 },
    { name: 'explanation.simple.zh', weight: 1 },
    { name: 'explanation.simple.ja', weight: 1 },
    { name: 'tags', weight: 1 },
  ],
})

export function searchTerms(query) {
  const q = String(query || '').trim()
  if (!q) return []
  return fuse.search(q).map((r) => r.item)
}
