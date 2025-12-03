import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import Backend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import * as Locales from 'date-fns/locale'

import { setDefaultOptions } from 'date-fns'

i18n.on('languageChanged', (lng) => {
  setDefaultOptions({
    locale: Locales[lng as keyof typeof Locales],
  })
})

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['tr', 'en'],
    fallbackLng: ['tr', 'en'],
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  })

const dynamicKey = (key: string, _defaultValue?: string) => key

export { i18n, dynamicKey }
