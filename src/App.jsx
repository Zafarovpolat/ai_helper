import { useEffect, useMemo, useRef, useState } from 'react'
import Avatar from './components/Avatar.jsx'
import { POPULAR } from './data/knowledgeBase.js'
import { answerFor } from './lib/search.js'
import { speak, stopSpeaking, isTtsSupported } from './lib/tts.js'
import { createRecognizer, isSttSupported } from './lib/stt.js'

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
    textHint: 'или введите текст вручную',
    noStt: 'Голосовой ввод недоступен в этом браузере — используйте текстовое поле.',
    source: 'Источник'
  },
  uz: {
    title: 'O\'zbekiston tarixi bo\'yicha gid',
    subtitle: 'Ovoz bilan so\'rang — faqat tekshirilgan materiallar asosida javob beraman',
    greeting: 'Assalomu alaykum! Men O\'zbekiston tarixi bo\'yicha gidingizman. Ovoz bilan savol bering yoki ro\'yxatdan tanlang.',
    idle: 'Sizni tinglayapman…',
    listening: 'Tinglayapman…',
    thinking: 'Bilimlar bazasidan izlayapman…',
    speaking: 'Javob beryapman…',
    you: 'Siz',
    guide: 'Gid',
    placeholder: 'Savol yozing…',
    ask: 'So\'rash',
    popular: 'Ommabop savollar',
    micHint: 'Mikrofonga bosing va savol bering',
    textHint: 'yoki matnni qo\'lda kiriting',
    noStt: 'Bu brauzerda ovozli kiritish mavjud emas — matn maydonidan foydalaning.',
    source: 'Manba'
  }
}

let uid = 0
const nextId = () => ++uid

export default function App() {
  const [lang, setLang] = useState('ru')
  const [status, setStatus] = useState('idle') // idle | listening | thinking | speaking
  const [transcript, setTranscript] = useState('')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(() => [
    { id: nextId(), role: 'guide', text: UI.ru.greeting }
  ])

  const ttsSupported = useMemo(isTtsSupported, [])
  const sttSupported = useMemo(isSttSupported, [])
  const recRef = useRef(null)
  const t = UI[lang]

  // При смене языка приветствие переводится (если диалог ещё не начат)
  useEffect(() => {
    stopSpeaking()
    setStatus('idle')
    setTranscript('')
  }, [lang])

  const handleUserText = (text) => {
    const clean = (text || '').trim()
    if (!clean) return
    stopSpeaking()
    setMessages((m) => [...m, { id: nextId(), role: 'user', text: clean }])
    setInput('')
    setTranscript('')
    setStatus('thinking')

    // Небольшая задержка «поиска» для естественности
    setTimeout(() => {
      const result = answerFor(clean, lang)
      const reply = { id: nextId(), role: 'guide', text: result.answer, source: result.source || null }
      setMessages((m) => [...m, reply])
      if (ttsSupported) {
        speak(result.answer, lang, {
          onStart: () => setStatus('speaking'),
          onEnd: () => setStatus('idle')
        })
      } else {
        setStatus('idle')
      }
    }, 600)
  }

  const toggleMic = () => {
    if (status === 'listening') {
      recRef.current?.stop()
      setStatus('idle')
      return
    }
    if (!sttSupported) return

    stopSpeaking()
    setStatus('listening')
    setTranscript('')

    recRef.current = createRecognizer(lang, {
      onInterim: (txt) => setTranscript(txt),
      onFinal: (txt, confidence) => handleUserText(txt),
      onError: (err) => {
        if (err === 'not-allowed') setTranscript(t.micHint)
        setStatus('idle')
      },
      onEnd: () => {
        if (status !== 'speaking' && status !== 'thinking') setStatus('idle')
      }
    })
    recRef.current?.start()
  }

  const statusLabel = t[status] || t.idle

  return (
    <div className="kiosk">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">◈</span>
          <div>
            <div className="brand-title">{t.title}</div>
            <div className="brand-sub">{t.subtitle}</div>
          </div>
        </div>
        <div className="lang-toggle">
          <button className={lang === 'ru' ? 'active' : ''} onClick={() => setLang('ru')}>RU</button>
          <button className={lang === 'uz' ? 'active' : ''} onClick={() => setLang('uz')}>UZ</button>
        </div>
      </header>

      <main className="stage">
        {/* Аватар */}
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
        </section>

        {/* Панель диалога */}
        <section className="panel">
          <div className="messages">
            {messages.map((m) => (
              <div key={m.id} className={`msg msg-${m.role}`}>
                <div className="msg-role">{m.role === 'user' ? t.you : t.guide}</div>
                <div className="bubble">{m.text}</div>
                {m.source && <div className="msg-source">{t.source}: {m.source}</div>}
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
                onClick={toggleMic}
                disabled={!sttSupported}
                title={t.micHint}
              >
                {status === 'listening' ? '◉' : '🎤'}
              </button>
              <div className="mic-text">
                <div>{t.micHint}</div>
                {sttSupported ? <div className="muted">{t.textHint}</div> : <div className="warn">{t.noStt}</div>}
              </div>
            </div>

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
              <button type="submit" disabled={!input.trim()}>{t.ask}</button>
            </form>

            <div className="popular">
              <div className="popular-title">{t.popular}</div>
              <div className="chips">
                {POPULAR[lang].map((q) => (
                  <button key={q} className="chip" onClick={() => handleUserText(q)}>{q}</button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
