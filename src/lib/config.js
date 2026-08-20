// Центральная конфигурация приложения.
// 'local' — полностью клиентский режим (GitHub Pages, офлайн).
// 'api'  — бэкенд по ТЗ (FastAPI + Whisper + Piper + RAG/LLM). URL задаётся через VITE_API_URL.
export const CONFIG = {
  backend: 'local',
  apiUrl: (import.meta.env && import.meta.env.VITE_API_URL) || null,

  stt: {
    minConfidence: 0.6, // ниже — просим повторить + текстовое поле (по ТЗ)
    maxAlternatives: 1,
  },

  cache: {
    enabled: true,
    key: 'ai-helper-cache-v1',
    unansweredKey: 'ai-helper-unanswered-v1',
    ttlMs: 7 * 24 * 60 * 60 * 1000, // 7 дней
    maxEntries: 100,
  },

  kiosk: {
    attractDelayMs: 30000, // через сколько бездействия показывать подсказку
    hintIntervalMs: 6000,
  },
}
