import { useEffect, useMemo, useRef, useState } from 'react'
import Avatar from './components/Avatar.jsx'
import { POPULAR } from './data/knowledgeBase.js'
import { answerFor } from './lib/search.js'
import { speak, stopSpeaking, isTtsSupported } from './lib/tts.js'
import { createRecognizer, isSttSupported, requestMic } from './lib/stt.js'
import { cacheAnswer, getCachedAnswer, logUnanswered } from './lib/cache.js'
import { CONFIG } from './lib/config.js'
import { BrandMark, MicIcon, HoldIcon, ExpandIcon, ShrinkIcon, SendIcon, SparkIcon } from './components/Icons.jsx'

const UI = {
  ru: {
    title: 'Гид по истории Узбекистана',
    subtitle: 'Спросите меня голосом — я отвечу только по проверенным материалам',
    greeting: 'Ассалому алайкум! Я — ваш гид по истории Узбекистана. Задайте вопрос голосом или выберите его из списка.',
    idle: 'Слушаю вас…',
    listening: 'Слушаю…',
    thinking: 'Ищу в базе знаний…',
    speaking: 'Отвечаю…',
    you: 'Вы',
    guide: 'Гид',
    placeholder: 'Введите вопрос…',
    ask: 'Спросить',
    popular: 'Популярные вопросы',
    micHint: 'Нажмите на микрофон и задайте вопрос',
    micHold: 'Удерживайте микрофон, пока говорите',
    textHint: 'или введите текст вручную',
    noStt: 'Голосовой ввод недоступен в этом браузере (например, Firefox) — используйте текстовое поле.',
    micDenied: 'Доступ к микрофону запрещён — разрешите его в браузере или используйте текстовое поле.',
    micNoDevice: 'Микрофон не найден — используйте текстовое поле.',
    source: 'Источник',
    offline: 'Офлайн',
    cached: 'из кэша',
    repeat: 'Не расслышал(а) вопрос — повторите, пожалуйста, или введите текст.',
    ptt: 'Удерживать',
    fullscreen: 'На весь экран',
    attract: 'Попробуйте спросить:'
  },
  uz: {
    title: "O'zbekiston tarixi bo'yicha gid",
    subtitle: "Ovoz bilan so'rang — faqat tekshirilgan materiallar asosida javob beraman",
    greeting: "Assalomu alaykum! Men O'zbekiston tarixi bo'yicha gidingizman. Ovoz bilan savol bering yoki ro'yxatdan tanlang.",
    idle: 'Sizni tinglayapman…',
    listening: 'Tinglayapman…',
    thinking: "Bilimlar bazasidan izlayapman…",
    speaking: 'Javob beryapman…',
    you: 'Siz',
    guide: 'Gid',
    placeholder: 'Savol yozing…',
    ask: "So'rash",
    popular: 'Ommabop savollar',
    micHint: 'Mikrofonga bosing va savol bering',
    micHold: "Gapirayotganingizda mikrofonni bosib turing",
    textHint: "yoki matnni qo'lda kiriting",
    noStt: "Bu brauzerda ovozli kiritish mavjud emas (masalan, Firefox) — matn maydonidan foydalaning.",
    micDenied: "Mikrofonga ruxsat berilmagan — brauzerda ruxsat bering yoki matn maydonidan foydalaning.",
    micNoDevice: "Mikrofon topilmadi — matn maydonidan foydalaning.",
    source: 'Manba',
    offline: 'Oflayn',
    cached: "keshdan",
    repeat: "Savolni eshitolmadim — takrorlang yoki matn kiriting.",
    ptt: 'Bosib turish',
    fullscreen: 'Butun ekran',
    attract: "So'rab ko'ring:"
  }
}

let uid = 0
const nextId = () => ++uid

export default function App() {
  const [lang, setLang] = useState('ru')
  const [status, setStatus] = useState('idle') // idle | listening | thinking | speaking
  const [transcript, setTranscript] = useState('')
  const [repeatPrompt, setRepeatPrompt] = useState(false)
  const [micError, setMicError] = useState(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(() => [{ id: nextId(), role: 'guide', text: UI.ru.greeting }])
  const [pushToTalk, setPushToTalk] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [online, setOnline] = useState(() => navigator.onLine)
  const [hint, setHint] = useState(null)

  const ttsSupported = useMemo(isTtsSupported, [])
  const sttSupported = useMemo(isSttSupported, [])
  const recRef = useRef(null)
  const listeningRef = useRef(false)
  const t = UI[lang]

  // Онлайн/офлайн
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  // Отслеживание fullscreen
  useEffect(() => {
    const f = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', f)
    return () => document.removeEventListener('fullscreenchange', f)
  }, [])

  // При смене языка — останавливаем речь
  useEffect(() => {
    stopSpeaking()
    setStatus('idle')
    setTranscript('')
    setRepeatPrompt(false)
  }, [lang])

  // Режим привлечения внимания (kiosk): после бездействия подсказываем популярный вопрос
  useEffect(() => {
    if (status !== 'idle') {
      setHint(null)
      return
    }
    let i = 0
    const first = setTimeout(() => setHint(POPULAR[lang][0]), CONFIG.kiosk.attractDelayMs)
    const iv = setInterval(() => {
      i = (i + 1) % POPULAR[lang].length
      setHint(POPULAR[lang][i])
    }, CONFIG.kiosk.hintIntervalMs)
    return () => {
      clearTimeout(first)
      clearInterval(iv)
    }
  }, [status, lang])

  const speakResult = (text) => {
    if (ttsSupported) {
      speak(text, lang, {
        onStart: () => setStatus('speaking'),
        onEnd: () => setStatus('idle')
      })
    } else {
      setStatus('idle')
    }
  }

  const pushGuide = (text, source, cached) => {
    setMessages((m) => [...m, { id: nextId(), role: 'guide', text, source: source || null, cached: !!cached }])
  }

  const respond = (clean) => {
    // 1. Кэш частых вопросов (мгновенный ответ, офлайн)
    const cached = getCachedAnswer(clean, lang)
    if (cached) {
      pushGuide(cached.answer, cached.source, true)
      speakResult(cached.answer)
      return
    }

    setStatus('thinking')
    setTimeout(() => {
      const result = answerFor(clean, lang)
      pushGuide(result.answer, result.source, false)
      if (!result.source) logUnanswered(clean, lang)
      cacheAnswer(clean, { answer: result.answer, source: result.source }, lang)
      speakResult(result.answer)
    }, 600)
  }

  const handleUserText = (text) => {
    const clean = (text || '').trim()
    if (!clean) return
    stopSpeaking()
    setMessages((m) => [...m, { id: nextId(), role: 'user', text: clean }])
    setInput('')
    setTranscript('')
    setRepeatPrompt(false)
    respond(clean)
  }

  const startListening = async () => {
    if (!sttSupported || listeningRef.current) return
    stopSpeaking()

    // Явный запрос микрофона + понятные ошибки
    const mic = await requestMic()
    if (mic === 'denied') {
      setMicError(t.micDenied)
      setStatus('idle')
      return
    }
    if (mic === 'no-device') {
      setMicError(t.micNoDevice)
      setStatus('idle')
      return
    }
    if (mic === 'error' || mic === 'unsupported') {
      setMicError(t.noStt)
      setStatus('idle')
      return
    }

    setMicError(null)
    setStatus('listening')
    setTranscript('')
    setRepeatPrompt(false)
    listeningRef.current = true

    recRef.current = createRecognizer(lang, {
      onInterim: (txt) => setTranscript(txt),
      onFinal: (txt, confidence) => {
        listeningRef.current = false
        // Порог уверенности по ТЗ: <60% → просим повторить + текстовое поле
        if (typeof confidence === 'number' && confidence < CONFIG.stt.minConfidence) {
          setTranscript(txt)
          setRepeatPrompt(true)
          setStatus('idle')
        } else {
          handleUserText(txt)
        }
      },
      onError: (err) => {
        listeningRef.current = false
        if (err === 'not-allowed') setTranscript(t.micDenied)
        setStatus('idle')
      },
      onEnd: () => {
        const wasListening = listeningRef.current
        listeningRef.current = false
        if (wasListening) setStatus('idle')
      }
    })
    recRef.current?.start()
  }

  const stopListening = () => {
    listeningRef.current = false
    recRef.current?.stop()
    setStatus('idle')
  }

  const toggleMic = () => {
    if (status === 'listening') stopListening()
    else startListening()
  }

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.()
    else document.documentElement.requestFullscreen?.()
  }

  const statusLabel = t[status] || t.idle

  // Обработчики кнопки микрофона: tap-to-talk или push-to-talk
  const micHandlers = pushToTalk
    ? {
        onPointerDown: (e) => {
          e.preventDefault()
          startListening()
        },
        onPointerUp: () => stopListening(),
        onPointerLeave: () => {
          if (listeningRef.current) stopListening()
        },
        onPointerCancel: () => stopListening()
      }
    : { onClick: toggleMic }

  return (
    <div className="kiosk">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark"><BrandMark size={30} /></span>
          <div>
            <div className="brand-title">{t.title}</div>
            <div className="brand-sub">{t.subtitle}</div>
          </div>
        </div>
        <div className="topbar-actions">
          {!online && <span className="badge badge-offline"><span className="badge-dot" />{t.offline}</span>}
          <button
            className={`icon-btn ${pushToTalk ? 'active' : ''}`}
            onClick={() => setPushToTalk((v) => !v)}
            title={t.ptt}
          >
            <HoldIcon size={17} /> <span className="icon-btn-label">{t.ptt}</span>
          </button>
          <button className="icon-btn" onClick={toggleFullscreen} title={t.fullscreen}>
            {fullscreen ? <ShrinkIcon size={17} /> : <ExpandIcon size={17} />}
          </button>
          <div className="lang-toggle">
            <button className={lang === 'ru' ? 'active' : ''} onClick={() => setLang('ru')}>RU</button>
            <button className={lang === 'uz' ? 'active' : ''} onClick={() => setLang('uz')}>UZ</button>
          </div>
        </div>
      </header>

      <main className="stage">
        <section className="avatar-pane">
          <Avatar
            talking={status === 'speaking'}
            listening={status === 'listening'}
            thinking={status === 'thinking'}
          />
          <div className="status-pill">
            <span className={`dot dot-${status}`} />
            {statusLabel}
          </div>
          {hint && status === 'idle' && (
            <div className="attract-hint">
              {t.attract} «{hint}»
            </div>
          )}
        </section>

        <section className="panel">
          <div className="messages">
            {messages.map((m) => (
              <div key={m.id} className={`msg msg-${m.role}`}>
                <div className="msg-role">{m.role === 'user' ? t.you : t.guide}</div>
                <div className="bubble">
                  {m.text}
                  {m.cached && <span className="cached-badge"><SparkIcon size={11} /> {t.cached}</span>}
                </div>
                {m.source && (
                  <div className="msg-source">
                    {t.source}: {m.source}
                  </div>
                )}
              </div>
            ))}
            {transcript && status === 'listening' && (
              <div className="msg msg-user interim">
                <div className="bubble">{transcript}</div>
              </div>
            )}
          </div>

          <div className="controls">
            <div className="mic-row">
              <button
                className={`mic ${status === 'listening' ? 'active' : ''}`}
                disabled={!sttSupported}
                title={pushToTalk ? t.micHold : t.micHint}
                {...micHandlers}
              >
                <MicIcon size={26} />
              </button>
              <div className="mic-text">
                <div>{pushToTalk ? t.micHold : t.micHint}</div>
                {sttSupported ? (
                  <div className="muted">{t.textHint}</div>
                ) : (
                  <div className="warn">{t.noStt}</div>
                )}
              </div>
            </div>

            {repeatPrompt && <div className="repeat-note">{t.repeat}</div>}
            {micError && <div className="mic-error">{micError}</div>}

            <form
              className="input-row"
              onSubmit={(e) => {
                e.preventDefault()
                handleUserText(input)
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.placeholder}
                autoComplete="off"
              />
              <button type="submit" disabled={!input.trim()}>
                {t.ask}
                <SendIcon size={16} />
              </button>
            </form>

            <div className="popular">
              <div className="popular-title">{t.popular}</div>
              <div className="chips">
                {POPULAR[lang].map((q) => (
                  <button key={q} className="chip" onClick={() => handleUserText(q)}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
