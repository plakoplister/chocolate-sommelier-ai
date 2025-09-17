import { useState, useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'
import FixedChatInput from './FixedChatInput'
import ChocolateRecommendations from '../Recommendations/ChocolateRecommendations'

// Client-side sommelier logic
const processMessageClientSide = async ({ message, currentPreferences, conversationHistory, chocolatesData }) => {
  // Extract preferences from message
  const extractedPreferences = extractPreferencesFromMessage(message)
  const updatedPreferences = { ...currentPreferences, ...extractedPreferences }

  // Check what's missing
  const requiredQuestions = ['cocoa_percentage', 'flavor_profile', 'origin_preference', 'budget', 'occasion']
  const missingInfo = requiredQuestions.filter(req => !updatedPreferences[req])

  let responseMessage = ''
  let recommendations = []

  // Check if this is follow-up after recommendations
  const hasAllPreferences = missingInfo.length === 0
  const previouslyHadRecommendations = conversationHistory.some(msg =>
    msg.type === 'assistant' && (msg.content.includes('sélection') || msg.content.includes('recommandations'))
  )

  if (conversationHistory.length <= 1) {
    responseMessage = "Bienvenue chez XOCOA. Pour vous recommander le chocolat parfait, j'aimerais connaître vos préférences. Commençons par le pourcentage de cacao : préférez-vous quelque chose de doux (50-60%), équilibré (70-75%), ou intense (80%+) ?"
  } else if (previouslyHadRecommendations && hasAllPreferences) {
    // Continue conversation after recommendations
    responseMessage = handleFollowUpMessage(message, updatedPreferences)
    if (!isRequestingNewSearch(message)) {
      recommendations = findRecommendations(updatedPreferences, chocolatesData)
    }
  } else if (missingInfo.length > 0) {
    responseMessage = getNextQuestion(missingInfo[0], updatedPreferences)
  } else {
    // We have ALL required info, make recommendations
    recommendations = findRecommendations(updatedPreferences, chocolatesData)
    responseMessage = generateRecommendationMessage(recommendations, updatedPreferences)
  }

  return {
    message: responseMessage,
    preferences: updatedPreferences,
    recommendations: recommendations.slice(0, 6)
  }
}

const extractPreferencesFromMessage = (message) => {
  const preferences = {}
  const lowerMessage = message.toLowerCase()

  // Cocoa percentage
  if (lowerMessage.includes('doux') || lowerMessage.includes('50') || lowerMessage.includes('60')) {
    preferences.cocoa_percentage = '50-60%'
  } else if (lowerMessage.includes('équilibré') || lowerMessage.includes('70') || lowerMessage.includes('75')) {
    preferences.cocoa_percentage = '70-75%'
  } else if (lowerMessage.includes('intense') || lowerMessage.includes('80') || lowerMessage.includes('90')) {
    preferences.cocoa_percentage = '80%+'
  }

  // Flavor profile
  if (lowerMessage.includes('fruité') || lowerMessage.includes('fruit')) {
    preferences.flavor_profile = 'fruité'
  } else if (lowerMessage.includes('épicé') || lowerMessage.includes('épice')) {
    preferences.flavor_profile = 'épicé'
  } else if (lowerMessage.includes('floral') || lowerMessage.includes('fleur')) {
    preferences.flavor_profile = 'floral'
  } else if (lowerMessage.includes('noisette') || lowerMessage.includes('noix')) {
    preferences.flavor_profile = 'noisette'
  } else if (lowerMessage.includes('caramel') || lowerMessage.includes('sucré')) {
    preferences.flavor_profile = 'caramel'
  }

  // Origin
  if (lowerMessage.includes('amérique du sud') || lowerMessage.includes('pérou') || lowerMessage.includes('équateur')) {
    preferences.origin_preference = 'south_america'
  } else if (lowerMessage.includes('afrique') || lowerMessage.includes('madagascar') || lowerMessage.includes('ghana')) {
    preferences.origin_preference = 'africa'
  } else if (lowerMessage.includes('asie') || lowerMessage.includes('vietnam')) {
    preferences.origin_preference = 'asia'
  }

  // Budget
  if (lowerMessage.includes('économique') || lowerMessage.includes('pas cher') || lowerMessage.includes('budget')) {
    preferences.budget = 'economique'
  } else if (lowerMessage.includes('premium') || lowerMessage.includes('cher') || lowerMessage.includes('luxe')) {
    preferences.budget = 'premium'
  } else {
    preferences.budget = 'standard'
  }

  // Occasion
  if (lowerMessage.includes('cadeau') || lowerMessage.includes('offrir') || lowerMessage.includes('mère') || lowerMessage.includes('ami')) {
    preferences.occasion = 'cadeau'
  } else if (lowerMessage.includes('bourbon') || lowerMessage.includes('whisky') || lowerMessage.includes('accord')) {
    preferences.occasion = 'accord'
  } else if (lowerMessage.includes('dégustation') || lowerMessage.includes('personnel')) {
    preferences.occasion = 'dégustation'
  }

  return preferences
}

const getNextQuestion = (missing, preferences) => {
  switch (missing) {
    case 'cocoa_percentage':
      return "Quel pourcentage de cacao préférez-vous ? Doux (50-60%), équilibré (70-75%), ou intense (80%+) ?"
    case 'flavor_profile':
      return "Quelles saveurs recherchez-vous ? Fruité, épicé, floral, noisette, ou caramel ?"
    case 'origin_preference':
      return "Avez-vous une préférence d'origine ? Amérique du Sud, Afrique, Asie, ou peu importe ?"
    case 'budget':
      return "Quel est votre budget ? Économique (<10€), standard (10-20€), ou premium (>20€) ?"
    case 'occasion':
      return "Pour quelle occasion ? Cadeau, dégustation personnelle, ou accord avec une boisson ?"
    default:
      return "Merci pour ces informations ! Laissez-moi vous proposer des recommandations."
  }
}

const findRecommendations = (preferences, chocolatesData) => {
  let filtered = chocolatesData.slice()

  // Filter by cocoa percentage
  if (preferences.cocoa_percentage) {
    if (preferences.cocoa_percentage === '50-60%') {
      filtered = filtered.filter(c => c.cocoa_percentage >= 50 && c.cocoa_percentage <= 60)
    } else if (preferences.cocoa_percentage === '70-75%') {
      filtered = filtered.filter(c => c.cocoa_percentage >= 70 && c.cocoa_percentage <= 75)
    } else if (preferences.cocoa_percentage === '80%+') {
      filtered = filtered.filter(c => c.cocoa_percentage >= 80)
    }
  }

  // Filter by origin
  if (preferences.origin_preference === 'south_america') {
    const southAmericanCountries = ['Ecuador', 'Venezuela', 'Peru', 'Brazil', 'Colombia']
    filtered = filtered.filter(c => southAmericanCountries.includes(c.origin_country))
  } else if (preferences.origin_preference === 'africa') {
    const africanCountries = ['Madagascar', 'Tanzania', 'Ghana', 'Uganda', 'Congo']
    filtered = filtered.filter(c => africanCountries.includes(c.origin_country))
  }

  // Filter by flavor
  if (preferences.flavor_profile) {
    filtered = filtered.filter(c => {
      const allFlavors = [
        c.flavor_notes_primary,
        c.flavor_notes_secondary,
        c.flavor_notes_tertiary
      ].join(' ').toLowerCase()
      return allFlavors.includes(preferences.flavor_profile.toLowerCase())
    })
  }

  // Sort by rating
  filtered.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))

  return filtered.slice(0, 6)
}

const generateRecommendationMessage = (recommendations, preferences) => {
  if (recommendations.length === 0) {
    return generateNoResultsMessage(preferences)
  }

  let message = `Parfait ! Basé sur vos préférences`
  if (preferences.cocoa_percentage) {
    message += ` (${preferences.cocoa_percentage} de cacao`
  }
  if (preferences.flavor_profile) {
    message += `, profil ${preferences.flavor_profile}`
  }
  if (preferences.origin_preference === 'south_america') {
    message += `, origine Amérique du Sud`
  }
  message += `), voici mes ${recommendations.length} recommandations personnalisées.\n\nN'hésitez pas à me dire si vous souhaitez plus d'informations sur l'un d'eux !`
  return message
}

const generateNoResultsMessage = (preferences) => {
  return "Je n'ai trouvé aucun chocolat correspondant exactement à tous vos critères. Souhaiteriez-vous assouplir l'un de vos critères pour que je puisse vous proposer des chocolats exceptionnels ?"
}

const handleFollowUpMessage = (message, preferences) => {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('merci') || lowerMessage.includes('thank')) {
    return "Je vous en prie ! C'est un plaisir de vous aider à découvrir de merveilleux chocolats. Avez-vous d'autres questions ?"
  }

  if (lowerMessage.includes('détail') || lowerMessage.includes('plus d\'info')) {
    return "Je serais ravi de vous donner plus de détails ! Quel chocolat vous intéresse particulièrement ?"
  }

  return "Comment puis-je vous aider davantage ? Souhaitez-vous explorer d'autres options ou avez-vous des questions sur ces recommandations ?"
}

const isRequestingNewSearch = (message) => {
  const lowerMessage = message.toLowerCase()
  return lowerMessage.includes('nouvelle recherche') ||
         lowerMessage.includes('recommencer') ||
         lowerMessage.includes('autres chocolats')
}

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
      // Load chocolate data and create client-side sommelier
      const chocolatesResponse = await fetch('/data/chocolates.json')
      const chocolatesData = await chocolatesResponse.json()

      // Simple client-side sommelier logic
      const result = await processMessageClientSide({
        message: content,
        currentPreferences: userPreferences,
        conversationHistory: messages,
        chocolatesData
      })

      // Add assistant response
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: result.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Update preferences if provided
      if (result.preferences) {
        setUserPreferences(prev => ({ ...prev, ...result.preferences }))
      }

      // Set recommendations if provided
      if (result.recommendations) {
        setRecommendations(result.recommendations)
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