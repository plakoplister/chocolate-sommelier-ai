import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export const LANGUAGES = {
  en: { code: 'en', name: 'English', flag: '🇬🇧' },
  fr: { code: 'fr', name: 'Français', flag: '🇫🇷' }
}

export function LanguageProvider({ children }) {
  // Initialize with browser language or saved preference
  const [language, setLanguage] = useState('fr')

  useEffect(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('xocoa-language')
    if (saved && LANGUAGES[saved]) {
      setLanguage(saved)
    } else {
      // Detect browser language
      const browserLang = navigator.language.substring(0, 2)
      if (LANGUAGES[browserLang]) {
        setLanguage(browserLang)
      }
    }
  }, [])

  const changeLanguage = (newLang) => {
    if (LANGUAGES[newLang]) {
      setLanguage(newLang)
      localStorage.setItem('xocoa-language', newLang)
    }
  }

  const value = {
    language,
    setLanguage: changeLanguage,
    languages: LANGUAGES
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}