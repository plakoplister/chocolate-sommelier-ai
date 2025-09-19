import { useLanguage } from '../contexts/LanguageContext'
import { translations, getTranslation } from '../translations/translations'

export function useTranslation() {
  const { language } = useLanguage()

  const t = (path, replacements = {}) => {
    let text = getTranslation(language, path)

    // Replace placeholders like {count}, {continent}, etc.
    Object.keys(replacements).forEach(key => {
      text = text.replace(new RegExp(`\\{${key}\\}`, 'g'), replacements[key])
    })

    return text
  }

  // Get all translations for current language
  const lang = translations[language] || translations.en

  return { t, lang }
}