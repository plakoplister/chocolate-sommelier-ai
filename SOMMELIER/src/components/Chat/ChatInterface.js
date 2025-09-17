import { useState, useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'
import FixedChatInput from './FixedChatInput'
import ChocolateRecommendations from '../Recommendations/ChocolateRecommendations'

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Bienvenue chez XOCOA. Je suis votre sommelier personnel du chocolat. Pour vous recommander le chocolat parfait, j'aimerais d'abord comprendre vos préférences. Quel type d'expérience chocolatée recherchez-vous aujourd'hui ?",
      timestamp: new Date()
    }
  ])
  const [recommendations, setRecommendations] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [userPreferences, setUserPreferences] = useState({})
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Call sommelier service to process the message
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          preferences: userPreferences,
          conversationHistory: messages
        }),
      })

      const data = await response.json()

      // Add assistant response
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Update preferences if provided
      if (data.preferences) {
        setUserPreferences(prev => ({ ...prev, ...data.preferences }))
      }

      // Set recommendations if provided
      if (data.recommendations) {
        setRecommendations(data.recommendations)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: "Je m'excuse, une erreur s'est produite. Pouvez-vous reformuler votre demande ?",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="chat-wrapper">
      {/* Zone des messages - scrollable */}
      <div className="chat-container chat-messages-container" style={{
        background: 'rgba(26, 26, 26, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--color-border)',
        borderRadius: '16px',
        padding: 'var(--space-md)',
        minHeight: 'calc(100vh - 180px)',
        maxHeight: 'calc(100vh - 180px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Chat Messages */}
        <div className="conversation-container flex-1 overflow-y-auto">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLoading={isLoading && message === messages[messages.length - 1]}
            />
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-charcoal rounded-2xl px-4 py-3 max-w-xs">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-accent-gold rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-accent-gold rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-accent-gold rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="border-t border-warm-gray p-6">
            <ChocolateRecommendations recommendations={recommendations} />
          </div>
        )}
      </div>

      {/* Fixed Chat Input - TOUJOURS en dehors et en dernier */}
      <FixedChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  )
}