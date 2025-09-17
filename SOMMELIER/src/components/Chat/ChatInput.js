import { useState, useRef } from 'react'

export default function ChatInput({ onSendMessage, disabled }) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const adjustHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-3">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
            adjustHeight()
          }}
          onKeyPress={handleKeyPress}
          placeholder="Décrivez vos préférences chocolatées..."
          className="w-full resize-none bg-charcoal/80 border-2 border-accent-gold/30 rounded-xl px-8 py-6 text-xl text-primary placeholder-muted focus:outline-none focus:ring-3 focus:ring-accent-gold/50 focus:border-accent-gold transition-all duration-300 min-h-[80px] max-h-[200px] font-sans"
          style={{ fontSize: '18px', lineHeight: '1.6' }}
          disabled={disabled}
          rows={2}
        />
      </div>

      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-accent-gold to-copper hover:from-copper hover:to-accent-gold disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
      >
        <svg
          className="w-6 h-6 text-primary-black"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </button>
    </form>
  )
}