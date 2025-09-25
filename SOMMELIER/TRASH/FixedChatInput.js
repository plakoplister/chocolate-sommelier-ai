import { useState, useRef, useEffect } from 'react'

export default function FixedChatInput({ onSendMessage, disabled }) {
  const [message, setMessage] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    // Set initial value
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e) => {
    // Envoi avec Cmd/Ctrl + Enter
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="chat-input-container" style={{
      position: 'fixed',
      bottom: '0',
      left: '0',
      right: '0',
      background: 'linear-gradient(to top, #0A0A0A 0%, rgba(10, 10, 10, 0.95) 100%)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(212, 175, 55, 0.3)',
      padding: '1rem 1.5rem 1.5rem',
      zIndex: '100',
      animation: 'slideUp 0.5s ease-out'
    }}>
      <div className="chat-input-wrapper" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative'
      }}>
        <form onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Décrivez vos préférences chocolatées... (Ctrl+Enter pour envoyer)"
            className="chat-textarea"
            disabled={disabled}
            rows={4}
            style={{
              width: '100%',
              minHeight: isMobile ? '80px' : '120px',
              maxHeight: isMobile ? '80px' : '120px',
              height: isMobile ? '80px' : '120px',
              resize: 'none',
              background: 'rgba(26, 26, 26, 0.8)',
              border: '2px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '12px',
              padding: isMobile ? '0.75rem 2.5rem 0.75rem 0.75rem' : '1rem 3rem 1rem 1rem',
              color: '#F5F5F5',
              fontFamily: 'var(--font-body)',
              fontSize: isMobile ? '0.9rem' : '1rem',
              lineHeight: '1.5',
              transition: 'all 0.3s ease',
              overflowY: 'auto',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#D4AF37'
              e.target.style.background = 'rgba(26, 26, 26, 0.95)'
              e.target.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.2)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(212, 175, 55, 0.4)'
              e.target.style.background = 'rgba(26, 26, 26, 0.8)'
              e.target.style.boxShadow = 'none'
            }}
          />

          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className="send-button"
            style={{
              position: 'absolute',
              right: isMobile ? '0.5rem' : '1rem',
              bottom: isMobile ? '0.5rem' : '1rem',
              background: 'linear-gradient(135deg, #D4AF37, #F4E5B3)',
              border: 'none',
              borderRadius: '8px',
              padding: isMobile ? '0.4rem 0.8rem' : '0.5rem 1rem',
              color: '#0A0A0A',
              fontWeight: '600',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: disabled ? '0.5' : '1',
              fontFamily: 'var(--font-body)',
              fontSize: isMobile ? '0.85rem' : '1rem'
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)'
              e.target.style.boxShadow = 'none'
            }}
          >
            {disabled ? 'Envoi...' : 'Envoyer'}
          </button>
        </form>
      </div>
    </div>
  )
}