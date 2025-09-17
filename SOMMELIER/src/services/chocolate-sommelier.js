import fs from 'fs'
import path from 'path'

export class ChocolateSommelier {
  constructor() {
    this.chocolates = []
    this.filters = {}
    this.loadData()
  }

  loadData() {
    try {
      const chocolatesPath = path.join(process.cwd(), 'data', 'chocolates.json')
      const filtersPath = path.join(process.cwd(), 'data', 'filters.json')

      this.chocolates = JSON.parse(fs.readFileSync(chocolatesPath, 'utf8'))
      this.filters = JSON.parse(fs.readFileSync(filtersPath, 'utf8'))

      console.log(`✅ Loaded ${this.chocolates.length} chocolates`)
    } catch (error) {
      console.error('❌ Error loading chocolate data:', error)
    }
  }

  async processUserMessage({ message, currentPreferences, conversationHistory }) {
    // Analyze the user's message for preferences
    const extractedPreferences = this.extractPreferences(message)

    // Merge with current preferences
    const updatedPreferences = { ...currentPreferences, ...extractedPreferences }

    // Determine conversation stage
    const conversationStage = this.determineConversationStage(updatedPreferences, conversationHistory)

    let responseMessage = ''
    let recommendations = []

    switch (conversationStage) {
      case 'greeting':
        responseMessage = this.getGreetingResponse()
        break

      case 'gathering_preferences':
        responseMessage = this.getPreferenceQuestions(updatedPreferences)
        break

      case 'ready_for_recommendations':
        recommendations = this.findRecommendations(updatedPreferences)
        responseMessage = this.generateRecommendationMessage(recommendations, updatedPreferences)
        break

      case 'refining_search':
        recommendations = this.findRecommendations(updatedPreferences)
        responseMessage = this.generateRefinementMessage(recommendations, updatedPreferences)
        break

      default:
        responseMessage = "Pouvez-vous me dire quel type de chocolat vous recherchez ?"
    }

    return {
      message: responseMessage,
      preferences: updatedPreferences,
      recommendations: recommendations.slice(0, 6) // Limit to 6 recommendations
    }
  }

  extractPreferences(message) {
    const preferences = {}
    const lowerMessage = message.toLowerCase()

    // Extract cocoa percentage
    const cocoaMatch = lowerMessage.match(/(\d+)%/)
    if (cocoaMatch) {
      preferences.cocoa_percentage = parseInt(cocoaMatch[1])
    }

    // Extract flavor preferences
    const flavorKeywords = {
      'fruité': ['fruity', 'fruit', 'berry', 'citrus'],
      'épicé': ['spicy', 'spice', 'pepper', 'cinnamon'],
      'floral': ['floral', 'flower', 'lavender'],
      'terreux': ['earthy', 'mushroom', 'soil'],
      'sucré': ['sweet', 'sugar', 'honey', 'caramel'],
      'amer': ['bitter', 'dark', 'intense'],
      'noix': ['nutty', 'nut', 'almond', 'hazelnut'],
      'vanille': ['vanilla', 'vanille']
    }

    for (const [french, keywords] of Object.entries(flavorKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        preferences.preferred_flavors = preferences.preferred_flavors || []
        preferences.preferred_flavors.push(french)
      }
    }

    // Extract origin preferences
    const origins = this.filters.origin_countries || []
    for (const origin of origins) {
      if (lowerMessage.includes(origin.toLowerCase())) {
        preferences.origin_country = origin
        break
      }
    }

    // Extract type preferences
    if (lowerMessage.includes('tablette') || lowerMessage.includes('bar')) {
      preferences.type = 'bar'
    } else if (lowerMessage.includes('truffe') || lowerMessage.includes('truffle')) {
      preferences.type = 'truffle'
    } else if (lowerMessage.includes('bonbon')) {
      preferences.type = 'bonbon'
    }

    // Extract texture preferences
    if (lowerMessage.includes('créme') || lowerMessage.includes('smooth')) {
      preferences.texture_mouthfeel = 'creamy'
    } else if (lowerMessage.includes('croquant') || lowerMessage.includes('snap')) {
      preferences.texture_snap = 'crisp'
    }

    // Extract price sensitivity
    if (lowerMessage.includes('budget') || lowerMessage.includes('pas cher')) {
      preferences.price_range = 'budget'
    } else if (lowerMessage.includes('premium') || lowerMessage.includes('luxe')) {
      preferences.price_range = 'premium'
    }

    return preferences
  }

  determineConversationStage(preferences, conversationHistory) {
    const prefCount = Object.keys(preferences).length

    if (conversationHistory.length <= 2) {
      return 'greeting'
    } else if (prefCount >= 1) {
      return 'ready_for_recommendations'
    } else {
      return 'gathering_preferences'
    }
  }

  getGreetingResponse() {
    const greetings = [
      "Excellente question ! Pour vous guider vers le chocolat parfait, j'aimerais connaître vos préférences. Aimez-vous plutôt les chocolats amers et intenses ou doux et fruités ?",
      "Parfait ! Dites-moi, recherchez-vous un chocolat pour une dégustation personnelle, un cadeau, ou pour accompagner un moment particulier ?",
      "Merveilleux ! Pour affiner ma sélection, quel pourcentage de cacao préférez-vous généralement ? Plutôt 70% et plus, ou quelque chose de plus doux ?"
    ]

    return greetings[Math.floor(Math.random() * greetings.length)]
  }

  getPreferenceQuestions(preferences) {
    const questions = []

    if (!preferences.cocoa_percentage) {
      questions.push("Quel pourcentage de cacao préférez-vous ? (par exemple 70%, 85%, ou plus doux ?)")
    }

    if (!preferences.preferred_flavors) {
      questions.push("Quelles saveurs vous attirent ? Fruités, épicés, terreux, ou plutôt des notes de vanille et caramel ?")
    }

    if (!preferences.type) {
      questions.push("Préférez-vous les tablettes, les truffes, ou les bonbons ?")
    }

    if (!preferences.origin_country) {
      questions.push("Avez-vous une préférence pour l'origine du cacao ? Madagascar, Équateur, Venezuela ?")
    }

    if (questions.length > 0) {
      return questions[0] // Return the first missing preference question
    }

    return "Parfait ! Avec ces informations, je peux vous faire d'excellentes recommandations."
  }

  findRecommendations(preferences) {
    let filteredChocolates = [...this.chocolates]

    // Filter by cocoa percentage
    if (preferences.cocoa_percentage) {
      const targetPercentage = preferences.cocoa_percentage
      filteredChocolates = filteredChocolates.filter(chocolate => {
        const cocoaPercent = parseFloat(chocolate.cocoa_percentage) || 0
        return Math.abs(cocoaPercent - targetPercentage) <= 10
      })
    }

    // Filter by type
    if (preferences.type) {
      filteredChocolates = filteredChocolates.filter(chocolate =>
        chocolate.type === preferences.type
      )
    }

    // Filter by origin
    if (preferences.origin_country) {
      filteredChocolates = filteredChocolates.filter(chocolate =>
        chocolate.origin_country === preferences.origin_country
      )
    }

    // Filter by flavor preferences
    if (preferences.preferred_flavors && preferences.preferred_flavors.length > 0) {
      filteredChocolates = filteredChocolates.filter(chocolate => {
        const flavors = [
          chocolate.flavor_notes_primary,
          chocolate.flavor_notes_secondary,
          chocolate.flavor_notes_tertiary
        ].join(' ').toLowerCase()

        return preferences.preferred_flavors.some(preferredFlavor => {
          const flavorWords = this.getFlavorWords(preferredFlavor)
          return flavorWords.some(word => flavors.includes(word))
        })
      })
    }

    // Filter by texture
    if (preferences.texture_mouthfeel) {
      filteredChocolates = filteredChocolates.filter(chocolate =>
        chocolate.texture_mouthfeel === preferences.texture_mouthfeel
      )
    }

    // Sort by rating (highest first)
    filteredChocolates.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))

    return filteredChocolates
  }

  getFlavorWords(flavorCategory) {
    const flavorMap = {
      'fruité': ['fruit', 'berry', 'citrus', 'apple', 'cherry', 'apricot'],
      'épicé': ['spice', 'cinnamon', 'pepper', 'ginger', 'cardamom'],
      'floral': ['floral', 'flower', 'lavender', 'rose'],
      'terreux': ['earthy', 'mushroom', 'soil', 'mineral'],
      'sucré': ['sweet', 'caramel', 'honey', 'sugar'],
      'amer': ['bitter', 'dark', 'intense', 'tannic'],
      'noix': ['nut', 'almond', 'hazelnut', 'pecan'],
      'vanille': ['vanilla', 'vanille']
    }

    return flavorMap[flavorCategory] || []
  }

  generateRecommendationMessage(recommendations, preferences) {
    if (recommendations.length === 0) {
      return "Je n'ai pas trouvé de chocolat correspondant exactement à vos critères. Pouvez-vous ajuster vos préférences ou essayer des critères différents ?"
    }

    const messages = [
      `Excellente sélection ! J'ai trouvé ${recommendations.length} chocolats qui correspondent parfaitement à vos goûts.`,
      `Voici mes recommandations personnalisées pour vous, basées sur vos préférences.`,
      `Ces chocolats devraient vous ravir selon les critères que vous m'avez donnés.`
    ]

    return messages[Math.floor(Math.random() * messages.length)]
  }

  generateRefinementMessage(recommendations, preferences) {
    if (recommendations.length === 0) {
      return "Aucun chocolat ne correspond à ces critères précis. Souhaitez-vous élargir la recherche ou modifier certaines préférences ?"
    }

    return `J'ai affiné la sélection selon vos nouveaux critères. Voici ${recommendations.length} options qui correspondent mieux à ce que vous recherchez.`
  }
}