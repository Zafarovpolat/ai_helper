// TTS: озвучка.
// - Русский: Google Translate TTS (MP3) — естественный голос, точные start/end для липсинка.
// - Узбекский и fallback: SpeechSynthesis (Web Speech API).
// События onStart/onEnd управляют анимацией рта аватара.

const LANG = { ru: 'ru', uz: 'uz' }
const SYNTH_LANG = { ru: 'ru-RU', uz: 'uz-UZ' }

// ---- SpeechSynthesis ----
let voices = []
let voicesReady = false

function loadVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  const v = window.speechSynthesis.getVoices()
  if (v && v.length) {
    voices = v
    voicesReady = true
  }
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
    list.find((v) => v.lang.toLowerCase().startsWith(prefix) && /google|natural|neural/i.test(v.name)) ||
    list.find((v) => v.lang.toLowerCase().startsWith(prefix)) ||
    null
  )
}

export function isTtsSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

let synthUtterance = null
let synthActive = false

function synthSpeak(text, lang, { onStart, onEnd }) {
  if (!isTtsSupported()) {
    onEnd?.()
    return
  }
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = SYNTH_LANG[lang] || SYNTH_LANG.ru
  const voice = pickVoice(lang)
  if (voice) u.voice = voice
  u.rate = 1.0
  u.pitch = 1.0
  u.onstart = () => {
    synthActive = true
    onStart?.()
  }
  u.onend = () => {
    synthActive = false
    onEnd?.()
  }
  u.onerror = () => {
    synthActive = false
    onEnd?.()
  }
  synthUtterance = u
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

let audioEls = []
let cancelled = false

function googleSpeak(text, lang, { onStart, onEnd }) {
  const chunks = chunkText(text)
  let started = false
  let idx = 0

  const fail = () => {
    // Не смогли — откат на speechSynthesis
    synthSpeak(text, lang, { onStart, onEnd })
  }

  const playNext = () => {
    if (cancelled || idx >= chunks.length) {
      if (!cancelled) onEnd?.()
      return
    }
    const url = `${GOOGLE_BASE}?ie=UTF-8&client=tw-ob&tl=${LANG[lang] || 'ru'}&q=${encodeURIComponent(chunks[idx])}`
    const a = new Audio()
    a.preload = 'auto'
    audioEls.push(a)
    a.src = url
    a.onplaying = () => {
      if (!started) {
        started = true
        onStart?.()
      }
    }
    a.onended = () => {
      idx++
      playNext()
    }
    a.onerror = () => {
      cancelled = true
      fail()
    }
    const p = a.play()
    if (p && p.catch) p.catch(() => fail())
  }

  playNext()
}

export function stopSpeaking() {
  cancelled = true
  audioEls.forEach((a) => {
    try {
      a.pause()
      a.src = ''
    } catch {
      /* ignore */
    }
  })
  audioEls = []
  if (synthActive && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    synthActive = false
  }
  // сброс флага для следующего вызова
  setTimeout(() => {
    cancelled = false
  }, 0)
}

/**
 * Озвучивает текст. Для русского предпочитаем Google TTS, иначе speechSynthesis.
 */
export function speak(text, lang, callbacks = {}) {
  const { onStart, onEnd } = callbacks
  stopSpeaking()
  if ((LANG[lang] || 'ru') === 'ru' && typeof window !== 'undefined' && navigator.onLine !== false) {
    googleSpeak(text, lang, { onStart, onEnd })
  } else {
    synthSpeak(text, lang, { onStart, onEnd })
  }
}
