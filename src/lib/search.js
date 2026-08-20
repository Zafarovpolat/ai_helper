// Упрощённый RAG: поиск по базе знаний без генерации — аватар возвращает
// только готовый проверенный ответ (никаких галлюцинаций).
import { ENTRIES, FALLBACK } from '../data/knowledgeBase.js'

const normalize = (s) =>
  (s || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/ʻ|‘|’/g, "'")
    .replace(/[^a-zа-я0-9'\- ]/g, ' ')

const tokenize = (s) => normalize(s).split(/\s+/).filter((t) => t.length > 1)

function scoreEntry(entry, query, tokens, lang) {
  let score = 0
  for (const kw of entry.keywords) {
    const kn = normalize(kw)
    if (!kn) continue
    if (query.includes(kn)) score += 4
    else if (tokens.some((t) => kn.includes(t) || t.includes(kn))) score += 2
  }
  const field = normalize(`${entry[lang].title} ${entry[lang].answer}`)
  if (query.length > 3 && field.includes(query)) score += 2
  return score
}

/**
 * Возвращает { entry, confidence } либо null, если уверенного совпадения нет.
 */
export function search(query, lang) {
  const q = normalize(query)
  const tokens = tokenize(q)
  if (!q.trim()) return null

  let best = null
  let bestScore = 0
  for (const entry of ENTRIES) {
    const s = scoreEntry(entry, q, tokens, lang)
    if (s > bestScore) {
      bestScore = s
      best = entry
    }
  }

  if (!best || bestScore < 2) return null
  return { entry: best, confidence: Math.min(1, bestScore / 8) }
}

/** Готовый ответ для отображения (запись или дежурная фраза). */
export function answerFor(query, lang) {
  const hit = search(query, lang)
  if (hit) return hit.entry[lang]
  return FALLBACK[lang]
}
