// STT: распознавание речи через Web Speech API (SpeechRecognition).
// Поддерживается в Chrome/Edge/Safari (webkit prefix), НЕ в Firefox.
// В продакшене (по ТЗ) сюда добавляется faster-whisper / Azure для узбекского.

const LANG = { ru: 'ru-RU', uz: 'uz-UZ' }

export function isSttSupported() {
  return typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
}

/** Прогреваем доступ к микрофону — явный запрос разрешения и понятные ошибки. */
export async function requestMic() {
  if (!navigator.mediaDevices?.getUserMedia) return 'unsupported'
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach((t) => t.stop())
    return 'ok'
  } catch (e) {
    if (e && (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError')) return 'denied'
    if (e && e.name === 'NotFoundError') return 'no-device'
    return 'error'
  }
}

export function createRecognizer(lang, { onInterim, onFinal, onError, onEnd }) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) return null

  const rec = new SR()
  rec.lang = LANG[lang] || LANG.ru
  rec.continuous = false
  rec.interimResults = true
  rec.maxAlternatives = 1

  rec.onresult = (e) => {
    let interim = ''
    let final = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const res = e.results[i]
      const text = res[0].transcript
      const confidence = res[0].confidence || 0
      if (res.isFinal) final += text
      else interim += text
    }
    if (interim) onInterim?.(interim)
    if (final) onFinal?.(final, confidence)
  }

  rec.onerror = (e) => onError?.(e.error)
  rec.onend = () => onEnd?.()

  return {
    start: () => {
      try {
        rec.start()
      } catch {
        /* уже запущен */
      }
    },
    stop: () => {
      try {
        rec.stop()
      } catch {
        /* ignore */
      }
    },
    abort: () => {
      try {
        rec.abort()
      } catch {
        /* ignore */
      }
    }
  }
}
