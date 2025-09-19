import { useLanguage } from '../../contexts/LanguageContext'

export default function LanguageSelector() {
  const { language, setLanguage, languages } = useLanguage()

  return (
    <div className="language-selector">
      {Object.values(languages).map(lang => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`language-btn ${language === lang.code ? 'active' : ''}`}
          aria-label={`Switch to ${lang.name}`}
        >
          <span className="flag">{lang.flag}</span>
          <span className="lang-name">{lang.name}</span>
        </button>
      ))}

      <style jsx>{`
        .language-selector {
          position: fixed;
          top: 20px;
          right: 20px;
          display: flex;
          gap: 8px;
          z-index: 1000;
          background: rgba(26, 26, 26, 0.8);
          backdrop-filter: blur(10px);
          padding: 8px;
          border-radius: 12px;
          border: 1px solid var(--color-border);
        }

        .language-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: transparent;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }

        .language-btn:hover {
          background: rgba(139, 111, 78, 0.1);
          border-color: var(--color-accent-gold);
          color: var(--color-text-primary);
        }

        .language-btn.active {
          background: rgba(139, 111, 78, 0.2);
          border-color: var(--color-accent-gold);
          color: var(--color-accent-gold);
        }

        .flag {
          font-size: 18px;
        }

        .lang-name {
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .language-selector {
            top: 10px;
            right: 10px;
          }

          .lang-name {
            display: none;
          }

          .language-btn {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  )
}