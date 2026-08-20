// TTS: озвучка через Web Speech API (SpeechSynthesis).
// Работает офлайн там, где есть локальные голоса. События start/end управляют липсинком.

const LANG = { ru: 'ru-RU', uz: 'uz-UZ' }

function pickVoice(lang) {
  const voices = window.speechSynthesis?.getVoices() || []
  if (!voices.length) return null
  const target = LANG[lang]
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith(target.slice(0, 2)) && v.localService) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(target.slice(0, 2))) ||
    null
  )
}

export function isTtsSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function stopSpeaking() {
  window.speechSynthesis?.cancel()
}

/**
 * Озвучивает текст. onStart/onEnd — колбэки для анимации рта.
 */
export function speak(text, lang, { onStart, onEnd } = {}) {
  if (!isTtsSupported()) {
    onEnd?.()
    return
  }
  const synth = window.speechSynthesis
  synth.cancel()

  const u = new SpeechSynthesisUtterance(text)
  u.lang = LANG[lang] || LANG.ru
  const voice = pickVoice(lang)
  if (voice) u.voice = voice
  u.rate = 1.0
  u.pitch = 1.05

  u.onstart = () => onStart?.()
  u.onend = () => onEnd?.()
  u.onerror = () => onEnd?.()

  synth.speak(u)
}
