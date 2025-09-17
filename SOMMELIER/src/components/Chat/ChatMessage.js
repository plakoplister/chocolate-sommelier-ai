import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function ChatMessage({ message }) {
  const isUser = message.type === 'user'

  return (
    <div className={`message-wrapper ${isUser ? 'user' : 'sommelier'}`} style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      marginBottom: '1.5rem',
      flexDirection: isUser ? 'row-reverse' : 'row',
      animation: 'slideIn 0.3s ease-out'
    }}>
      {/* Avatar */}
      <div className={`message-avatar ${isUser ? 'user' : 'sommelier'}`} style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600',
        fontSize: '1.25rem',
        flexShrink: '0',
        ...(isUser ? {
          background: 'linear-gradient(135deg, #D4AF37, #F4E5B3)',
          color: '#0A0A0A'
        } : {
          background: '#1A1A1A',
          border: '2px solid #D4AF37',
          color: '#D4AF37'
        })
      }}>
        {isUser ? 'U' : 'S'}
      </div>

      {/* Message Bubble */}
      <div className={`message-bubble ${isUser ? 'message-user' : 'message-sommelier'}`} style={{
        position: 'relative',
        padding: '1rem 1.25rem',
        maxWidth: '70%',
        transition: 'all 0.2s ease',
        ...(isUser ? {
          background: 'linear-gradient(135deg, #D4AF37, #F4E5B3)',
          color: '#0A0A0A',
          borderRadius: '18px 18px 4px 18px',
          boxShadow: '0 2px 8px rgba(212, 175, 55, 0.25)'
        } : {
          background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(26, 26, 26, 0.85))',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          color: '#F5F5F5',
          borderRadius: '18px 18px 18px 4px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
        })
      }}>
        {/* Accent doré pour le sommelier */}
        {!isUser && (
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '3px',
            height: '100%',
            background: 'linear-gradient(180deg, #D4AF37, transparent)',
            borderRadius: '0 0 0 18px'
          }} />
        )}

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          lineHeight: '1.5',
          margin: '0',
          whiteSpace: 'pre-wrap',
          color: isUser ? '#0A0A0A !important' : '#F5F5F5'
        }}>
          {message.content}
        </p>

        <div className="message-time" style={{
          fontSize: '0.75rem',
          color: isUser ? 'rgba(10, 10, 10, 0.7)' : 'rgba(245, 245, 245, 0.7)',
          marginTop: '0.5rem',
          fontFamily: 'var(--font-body)'
        }}>
          {formatDistanceToNow(new Date(message.timestamp), {
            addSuffix: true,
            locale: fr
          })}
        </div>
      </div>
    </div>
  )
}