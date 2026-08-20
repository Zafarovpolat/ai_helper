// Офлайн-кэш ответов (по ТЗ: «Кэш топ-30 частых вопросов», fallback при обрыве сети)
// и журнал вопросов, на которые не нашлось ответа (по ТЗ: «логи вопросов без ответа»).
import { CONFIG } from './config.js'

const now = () => Date.now()
const normalize = (s) => (s || '').toLowerCase().trim().replace(/\s+/g, ' ')

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* переполнение хранилища — игнорируем */
  }
}

/** Кэширует готовый ответ { answer, source } для вопроса. */
export function cacheAnswer(question, value, lang) {
  if (!CONFIG.cache.enabled || !value) return
  const store = read(CONFIG.cache.key, {})
  store[`${normalize(question)}:${lang}`] = { value, ts: now() }
  prune(store)
  write(CONFIG.cache.key, store)
}

/** Возвращает кэшированный ответ или null. */
export function getCachedAnswer(question, lang) {
  if (!CONFIG.cache.enabled) return null
  const store = read(CONFIG.cache.key, {})
  const hit = store[`${normalize(question)}:${lang}`]
  if (hit && now() - hit.ts < CONFIG.cache.ttlMs) return hit.value
  return null
}

/** Логирует вопрос без ответа (для доработки базы историком). */
export function logUnanswered(question, lang) {
  try {
    const list = read(CONFIG.cache.unansweredKey, [])
    list.push({ q: question, lang, ts: now() })
    write(CONFIG.cache.unansweredKey, list.slice(-200))
  } catch {
    /* ignore */
  }
}

function prune(store) {
  const keys = Object.keys(store)
  if (keys.length <= CONFIG.cache.maxEntries) return
  keys.sort((a, b) => (store[a].ts || 0) - (store[b].ts || 0))
  keys.slice(0, keys.length - CONFIG.cache.maxEntries).forEach((k) => delete store[k])
}
