// TTS: озвучка.
// - Русский: Google Translate TTS (MP3) — естественный голос.
// - Узбекский и fallback: SpeechSynthesis (Web Speech API).
// Надёжная отмена через «сессии»: каждый вызов speak() получает номер,
// устаревшие колбэки игнорируются. События onStart/onEnd управляют липсинком.

const LANG = { ru: 'ru', uz: 'uz' }
const SYNTH_LANG = { ru: 'ru-RU', uz: 'uz-UZ' }

// ---- SpeechSynthesis ----
let voices = []
function loadVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  const v = window.speechSynthesis.getVoices()
  if (v && v.length) voices = v
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices()
  window.speechSynthesis.onvoiceschanged = loadVoices
}

function pickVoice(lang) {
  const target = SYNTH_LANG[lang] || 'ru-RU'
  const prefix = target.slice(0, 2)
  const list = voices.length ? voices : window.speechSynthesis?.getVoices() || []
  if (!list.length) return null
  return (
    list.find((v) => v.lang.toLowerCase().startsWith(prefix) && /google|natural|neural|online/i.test(v.name)) ||
    list.find((v) => v.lang.toLowerCase().startsWith(prefix)) ||
    null
  )
}

export function isTtsSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

// ---- Сессия / отмена ----
let session = 0
let audioEls = []

export function stopSpeaking() {
  session++ // обесцениваем все текущие колбэки
  audioEls.forEach((a) => {
    try {
      a.pause()
      a.removeAttribute('src')
      a.load()
    } catch {
      /* ignore */
    }
  })
  audioEls = []
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* ignore */
    }
  }
}

// ---- SpeechSynthesis ----
function synthSpeak(text, lang, sess, { onStart, onEnd }) {
  if (!isTtsSupported()) {
    onEnd?.()
    return
  }
  const synth = window.speechSynthesis
  const u = new SpeechSynthesisUtterance(text)
  u.lang = SYNTH_LANG[lang] || SYNTH_LANG.ru
  const voice = pickVoice(lang)
  if (voice) u.voice = voice
  u.rate = 1.0
  u.pitch = 1.0
  u.onstart = () => {
    if (sess === session) onStart?.()
  }
  u.onend = () => {
    if (sess === session) onEnd?.()
  }
  u.onerror = () => {
    if (sess === session) onEnd?.()
  }
  synth.speak(u)
}

// ---- Google Translate TTS (MP3) ----
const GOOGLE_BASE = 'https://translate.google.com/translate_tts'

function chunkText(text, max = 180) {
  const sentences = text.match(/[^.!?…]+[.!?…]*/g) || [text]
  const chunks = []
  let cur = ''
  for (const s of sentences) {
    const part = s.trim()
    if (!part) continue
    if ((cur + ' ' + part).length > max && cur) {
      chunks.push(cur.trim())
      cur = part
    } else {
      cur = cur ? cur + ' ' + part : part
    }
  }
  if (cur.trim()) chunks.push(cur.trim())
  return chunks.length ? chunks : [text]
}

function googleSpeak(text, lang, sess, { onStart, onEnd }) {
  const chunks = chunkText(text)
  let started = false
  let idx = 0

  const fallback = () => {
    if (sess !== session) return
    // Не смогли через Google — откат на speechSynthesis
    synthSpeak(text, lang, sess, { onStart, onEnd })
  }

  const playNext = () => {
    if (sess !== session) return
    if (idx >= chunks.length) {
      onEnd?.()
      return
    }
    const url = `${GOOGLE_BASE}?ie=UTF-8&client=tw-ob&tl=${LANG[lang] || 'ru'}&q=${encodeURIComponent(chunks[idx])}`
    const a = new Audio()
    a.preload = 'auto'
    audioEls.push(a)
    a.src = url

    // Если звук не начал играть за 3 сек — откат на speechSynthesis
    const startTimeout = setTimeout(() => {
      if (sess === session && !started) fallback()
    }, 3000)
    a.onplaying = () => {
      clearTimeout(startTimeout)
      if (sess !== session) return
      if (!started) {
        started = true
        onStart?.()
      }
    }
    a.onended = () => {
      clearTimeout(startTimeout)
      if (sess !== session) return
      idx++
      playNext()
    }
    a.onerror = () => {
      clearTimeout(startTimeout)
      if (sess !== session) return
      fallback()
    }
    const p = a.play()
    if (p && p.catch) p.catch(() => fallback())
  }

  playNext()
}

/**
 * Озвучивает текст. Русский → Google TTS (с откатом на speechSynthesis),
 * узбекский и офлайн → speechSynthesis.
 */
export function speak(text, lang, callbacks = {}) {
  const { onStart, onEnd } = callbacks
  stopSpeaking() // отменяет предыдущую озвучку
  const sess = ++session // новая сессия

  const useGoogle = (LANG[lang] || 'ru') === 'ru' && navigator.onLine !== false
  if (useGoogle) {
    googleSpeak(text, lang, sess, { onStart, onEnd })
  } else {
    synthSpeak(text, lang, sess, { onStart, onEnd })
  }
}
