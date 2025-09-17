import { ChocolateSommelier } from './chocolate-sommelier'

export class EnhancedSommelier extends ChocolateSommelier {
  constructor() {
    super()
    this.conversationStep = 0
    this.requiredQuestions = [
      'cocoa_percentage',
      'flavor_profile',
      'origin_preference',
      'budget',
      'occasion'
    ]
  }

  async processUserMessage({ message, currentPreferences, conversationHistory }) {
    // Extract preferences from message
    const extractedPreferences = this.extractPreferencesEnhanced(message)
    const updatedPreferences = { ...currentPreferences, ...extractedPreferences }

    // Generate appropriate response based on what's missing
    let responseMessage = ''
    let recommendations = []

    // Check if this is a follow-up message after recommendations
    const hasAllPreferences = this.getMissingPreferences(updatedPreferences).length === 0
    const previouslyHadRecommendations = conversationHistory.some(msg =>
      msg.type === 'assistant' && (msg.content.includes('sélection') || msg.content.includes('recommandations'))
    )

    // Check what we still need to ask
    const missingInfo = this.getMissingPreferences(updatedPreferences)

    if (conversationHistory.length <= 1) {
      responseMessage = "Bienvenue chez XOCOA. Pour vous recommander le chocolat parfait, j'aimerais connaître vos préférences. Commençons par le pourcentage de cacao : préférez-vous quelque chose de doux (50-60%), équilibré (70-75%), ou intense (80%+) ?"
    } else if (previouslyHadRecommendations && hasAllPreferences) {
      // Continue conversation after recommendations
      responseMessage = this.handleFollowUpMessage(message, updatedPreferences)
      // Keep showing current recommendations unless user wants to change criteria
      if (!this.isRequestingNewSearch(message)) {
        recommendations = this.findRecommendationsEnhanced(updatedPreferences)
      }
    } else if (missingInfo.length > 0) {
      responseMessage = this.getNextQuestion(missingInfo[0], updatedPreferences)
    } else {
      // We have ALL required info, make recommendations
      recommendations = this.findRecommendationsEnhanced(updatedPreferences)
      responseMessage = this.generateEnhancedRecommendationMessage(recommendations, updatedPreferences)
    }

    return {
      message: responseMessage,
      preferences: updatedPreferences,
      recommendations: recommendations.slice(0, 6)
    }
  }

  extractPreferencesEnhanced(message) {
    const preferences = {}
    const lowerMessage = message.toLowerCase()

    // Extract cocoa percentage
    const cocoaMatch = lowerMessage.match(/(\d+)\s*%/)
    if (cocoaMatch) {
      preferences.cocoa_percentage = parseInt(cocoaMatch[1])
    }

    // Extract geographic preferences - AMÉRIQUE DU SUD
    const southAmericaKeywords = ['amérique du sud', 'amerique du sud', 'south america', 'sud américain']
    if (southAmericaKeywords.some(keyword => lowerMessage.includes(keyword))) {
      preferences.origin_preference = 'south_america'
    } else if (lowerMessage.includes('afrique')) {
      preferences.origin_preference = 'africa'
    } else if (lowerMessage.includes('asie')) {
      preferences.origin_preference = 'asia'
    } else if (lowerMessage.includes('europe')) {
      preferences.origin_preference = 'europe'
    }

    // Extract specific countries
    const countries = {
      'équateur': 'Ecuador',
      'ecuador': 'Ecuador',
      'venezuela': 'Venezuela',
      'pérou': 'Peru',
      'peru': 'Peru',
      'brésil': 'Brazil',
      'brazil': 'Brazil',
      'colombie': 'Colombia',
      'colombia': 'Colombia',
      'madagascar': 'Madagascar',
      'tanzanie': 'Tanzania',
      'ghana': 'Ghana',
      'vietnam': 'Vietnam'
    }

    for (const [keyword, country] of Object.entries(countries)) {
      if (lowerMessage.includes(keyword)) {
        preferences.origin_country = country
        break
      }
    }

    // Extract flavor preferences from Lists
    const flavorProfiles = {
      'fruité': ['fruit', 'berry', 'citrus', 'apple', 'cherry'],
      'floral': ['floral', 'flower', 'lavender', 'rose'],
      'épicé': ['spice', 'cinnamon', 'pepper', 'cardamom'],
      'boisé': ['wood', 'oak', 'cedar'],
      'terreux': ['earthy', 'mushroom', 'mineral'],
      'noisette': ['nut', 'almond', 'hazelnut', 'pecan'],
      'caramel': ['caramel', 'toffee', 'butterscotch'],
      'vanille': ['vanilla'],
      'intense': ['intense', 'bold', 'strong']
    }

    for (const [profile, keywords] of Object.entries(flavorProfiles)) {
      if (keywords.some(k => lowerMessage.includes(k))) {
        preferences.flavor_profile = profile
        break
      }
    }

    // Extract budget
    if (lowerMessage.includes('budget') || lowerMessage.includes('économique') || lowerMessage.includes('pas cher')) {
      preferences.budget = 'economique'
    } else if (lowerMessage.includes('premium') || lowerMessage.includes('luxe') || lowerMessage.includes('haut de gamme')) {
      preferences.budget = 'premium'
    } else if (lowerMessage.includes('milieu de gamme') || lowerMessage.includes('standard')) {
      preferences.budget = 'standard'
    }

    // Extract occasion
    if (lowerMessage.includes('cadeau') || lowerMessage.includes('offrir')) {
      preferences.occasion = 'cadeau'
    } else if (lowerMessage.includes('dégustation') || lowerMessage.includes('tasting')) {
      preferences.occasion = 'degustation'
    } else if (lowerMessage.includes('cuisine') || lowerMessage.includes('pâtisserie')) {
      preferences.occasion = 'cuisine'
    }

    // Extract follow-up preferences modifications
    if (lowerMessage.includes('plus cher') || lowerMessage.includes('premium')) {
      preferences.budget = 'premium'
    } else if (lowerMessage.includes('moins cher') || lowerMessage.includes('économique')) {
      preferences.budget = 'economique'
    }

    if (lowerMessage.includes('plus intense') || lowerMessage.includes('plus fort')) {
      preferences.cocoa_percentage = Math.min((preferences.cocoa_percentage || 70) + 10, 90)
    } else if (lowerMessage.includes('plus doux') || lowerMessage.includes('moins fort')) {
      preferences.cocoa_percentage = Math.max((preferences.cocoa_percentage || 70) - 10, 50)
    }

    return preferences
  }

  getMissingPreferences(preferences) {
    const missing = []

    if (!preferences.cocoa_percentage) missing.push('cocoa_percentage')
    if (!preferences.flavor_profile) missing.push('flavor_profile')
    if (!preferences.origin_preference && !preferences.origin_country) missing.push('origin_preference')
    if (!preferences.budget) missing.push('budget')
    if (!preferences.occasion) missing.push('occasion')

    return missing
  }

  getNextQuestion(missingItem, preferences) {
    const questions = {
      cocoa_percentage: "Quel pourcentage de cacao préférez-vous ? Les options populaires sont :\n• 50-60% - Doux et crémeux\n• 70-75% - Équilibré\n• 80-85% - Intense\n• 90%+ - Très amer",

      flavor_profile: `Quelles saveurs recherchez-vous ? Voici les profils disponibles :\n• Fruité (${this.filters.flavors?.filter(f => f.includes('fruit')).slice(0, 3).join(', ')})\n• Floral (notes délicates)\n• Épicé (cannelle, poivre)\n• Noisette (amande, noisette)\n• Caramel/Vanille (doux et sucré)\n• Terreux (champignon, minéral)`,

      origin_preference: "Quelle origine préférez-vous ?\n• Amérique du Sud (Équateur, Venezuela, Pérou)\n• Afrique (Madagascar, Tanzanie, Ghana)\n• Asie (Vietnam, Indonésie)\n• Ou un pays spécifique ?",

      budget: "Quel est votre budget ?\n• Économique (< 10$/tablette)\n• Standard (10-20$/tablette)\n• Premium (> 20$/tablette)",

      occasion: "Pour quelle occasion recherchez-vous ce chocolat ?\n• Cadeau (emballage et prestige importants)\n• Dégustation personnelle (focus sur la qualité)\n• Cuisine/Pâtisserie (usage culinaire)\n• Occasion spéciale (anniversaire, fêtes)"
    }

    return questions[missingItem] || "Pouvez-vous m'en dire plus sur vos préférences ? Il me manque encore quelques informations pour vous faire la recommendation parfaite."
  }

  findRecommendationsEnhanced(preferences) {
    let filteredChocolates = [...this.chocolates]

    // Filter by cocoa percentage
    if (preferences.cocoa_percentage) {
      const target = preferences.cocoa_percentage
      filteredChocolates = filteredChocolates.filter(chocolate => {
        const cocoa = parseFloat(chocolate.cocoa_percentage) || 0
        return Math.abs(cocoa - target) <= 10
      })
    }

    // Filter by geographic origin - CORRECTED
    if (preferences.origin_preference === 'south_america') {
      const southAmericanCountries = ['Ecuador', 'Venezuela', 'Peru', 'Brazil', 'Colombia', 'Bolivia', 'Argentina']
      filteredChocolates = filteredChocolates.filter(chocolate =>
        southAmericanCountries.includes(chocolate.origin_country)
      )
    } else if (preferences.origin_preference === 'africa') {
      const africanCountries = ['Madagascar', 'Tanzania', 'Ghana', 'Uganda', 'Congo', 'Ivory Coast']
      filteredChocolates = filteredChocolates.filter(chocolate =>
        africanCountries.includes(chocolate.origin_country)
      )
    } else if (preferences.origin_preference === 'asia') {
      const asianCountries = ['Vietnam', 'Indonesia', 'India', 'Philippines', 'Malaysia']
      filteredChocolates = filteredChocolates.filter(chocolate =>
        asianCountries.includes(chocolate.origin_country)
      )
    }

    // Filter by specific country
    if (preferences.origin_country) {
      filteredChocolates = filteredChocolates.filter(chocolate =>
        chocolate.origin_country === preferences.origin_country
      )
    }

    // Filter by flavor profile
    if (preferences.flavor_profile) {
      const flavorKeywords = this.getFlavorKeywords(preferences.flavor_profile)
      filteredChocolates = filteredChocolates.filter(chocolate => {
        const allFlavors = [
          chocolate.flavor_notes_primary,
          chocolate.flavor_notes_secondary,
          chocolate.flavor_notes_tertiary
        ].join(' ').toLowerCase()

        return flavorKeywords.some(keyword => allFlavors.includes(keyword))
      })
    }

    // Filter by budget
    if (preferences.budget) {
      filteredChocolates = filteredChocolates.filter(chocolate => {
        const price = parseFloat(chocolate.price_retail) || 15
        if (preferences.budget === 'economique') return price < 10
        if (preferences.budget === 'standard') return price >= 10 && price <= 20
        if (preferences.budget === 'premium') return price > 20
        return true
      })
    }

    // Sort by rating
    filteredChocolates.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))

    return filteredChocolates
  }

  getFlavorKeywords(profile) {
    const keywords = {
      'fruité': ['fruit', 'berry', 'citrus', 'apple', 'cherry', 'apricot', 'plum'],
      'floral': ['floral', 'flower', 'lavender', 'rose', 'jasmine'],
      'épicé': ['spice', 'cinnamon', 'pepper', 'cardamom', 'ginger', 'clove'],
      'boisé': ['wood', 'oak', 'cedar', 'tobacco'],
      'terreux': ['earthy', 'mushroom', 'mineral', 'soil'],
      'noisette': ['nut', 'almond', 'hazelnut', 'pecan', 'walnut'],
      'caramel': ['caramel', 'toffee', 'butterscotch', 'honey', 'sugar'],
      'vanille': ['vanilla'],
      'intense': ['intense', 'bold', 'strong', 'bitter', 'dark']
    }
    return keywords[profile] || []
  }

  generateEnhancedRecommendationMessage(recommendations, preferences) {
    if (recommendations.length === 0) {
      return this.generateNoResultsMessage(preferences)
    }

    let message = `Parfait ! Basé sur vos préférences`

    if (preferences.cocoa_percentage) {
      message += ` (${preferences.cocoa_percentage}% de cacao`
    }
    if (preferences.flavor_profile) {
      message += `, profil ${preferences.flavor_profile}`
    }
    if (preferences.origin_preference === 'south_america') {
      message += `, origine Amérique du Sud`
    } else if (preferences.origin_country) {
      message += `, origine ${preferences.origin_country}`
    }

    message += `), voici mes ${recommendations.length} recommandations personnalisées.\n\nN'hésitez pas à me dire si vous souhaitez plus d'informations sur l'un d'eux, ou si vous voulez affiner votre recherche !`

    return message
  }

  handleFollowUpMessage(message, preferences) {
    const lowerMessage = message.toLowerCase()

    // Handle thank you messages
    if (lowerMessage.includes('merci') || lowerMessage.includes('thank')) {
      return "Je vous en prie ! C'est un plaisir de vous aider à découvrir de merveilleux chocolats. Avez-vous d'autres questions sur ces recommandations ou souhaitez-vous explorer d'autres options ?"
    }

    // Handle requests for more info
    if (lowerMessage.includes('plus d\'info') || lowerMessage.includes('détail') || lowerMessage.includes('expliquer')) {
      return "Bien sûr ! Quel chocolat vous intéresse particulièrement ? Je peux vous en dire plus sur son origine, ses notes de dégustation, ou ses accords recommandés."
    }

    // Handle search refinement
    if (lowerMessage.includes('autre') || lowerMessage.includes('différent') || lowerMessage.includes('changer')) {
      return "Parfaitement ! Que souhaitez-vous modifier dans votre recherche ? Le pourcentage de cacao, l'origine, les saveurs, le budget, ou l'occasion ?"
    }

    // Handle general questions
    if (lowerMessage.includes('?')) {
      return "Je suis là pour répondre à toutes vos questions sur le chocolat ! Que souhaitez-vous savoir ?"
    }

    // Default friendly response
    return "Je suis ravi que ces recommandations vous intéressent ! Comment puis-je vous aider davantage ? Souhaitez-vous plus d'informations sur l'un de ces chocolats ou explorer d'autres options ?"
  }

  isRequestingNewSearch(message) {
    const lowerMessage = message.toLowerCase()
    return lowerMessage.includes('nouvelle recherche') ||
           lowerMessage.includes('recommencer') ||
           lowerMessage.includes('autres chocolats') ||
           lowerMessage.includes('changer critères')
  }

  generateNoResultsMessage(preferences) {
    let message = "Je n'ai trouvé aucun chocolat correspondant exactement à tous vos critères"

    // Identify the criteria that might be too restrictive
    const restrictiveCriteria = []

    if (preferences.cocoa_percentage && (preferences.cocoa_percentage.includes('90') || preferences.cocoa_percentage.includes('85'))) {
      restrictiveCriteria.push('pourcentage de cacao très élevé')
    }

    if (preferences.flavor_profile && ['terreux', 'boisé'].includes(preferences.flavor_profile)) {
      restrictiveCriteria.push('profil gustatif spécialisé')
    }

    if (preferences.budget === 'economique') {
      restrictiveCriteria.push('budget économique')
    }

    if (preferences.origin_country && !['Madagascar', 'Ecuador', 'Venezuela'].includes(preferences.origin_country)) {
      restrictiveCriteria.push('origine géographique spécifique')
    }

    if (restrictiveCriteria.length > 0) {
      message += ` (critères très spécifiques: ${restrictiveCriteria.join(', ')})`
    }

    message += ".\n\n**Suggestions pour élargir votre recherche :**\n\n"

    // Provide specific alternatives
    const alternatives = []

    if (preferences.cocoa_percentage && preferences.cocoa_percentage.includes('80')) {
      alternatives.push("• Essayer une gamme 75-85% au lieu de 80%+ pour plus d'options")
    }

    if (preferences.flavor_profile) {
      const alternativeProfiles = {
        'terreux': 'boisé ou épicé',
        'boisé': 'terreux ou noisette',
        'épicé': 'fruité ou floral',
        'fruité': 'floral ou épicé'
      }
      const alt = alternativeProfiles[preferences.flavor_profile]
      if (alt) {
        alternatives.push(`• Considérer un profil ${alt} en alternative`)
      }
    }

    if (preferences.budget === 'economique') {
      alternatives.push("• Élargir le budget à la gamme standard (10-20$) pour plus de choix")
    }

    if (preferences.origin_country) {
      const continentAlts = {
        'Madagascar': 'autres pays africains (Ghana, Tanzania)',
        'Venezuela': 'autres pays sud-américains (Ecuador, Peru)',
        'Ecuador': 'autres pays sud-américains (Venezuela, Peru)',
        'Peru': 'autres pays sud-américains (Ecuador, Venezuela)'
      }
      const alt = continentAlts[preferences.origin_country]
      if (alt) {
        alternatives.push(`• Explorer ${alt}`)
      }
    }

    if (alternatives.length === 0) {
      alternatives.push("• Assouplir l'un de vos critères pour découvrir de nouvelles options")
      alternatives.push("• Me laisser vous proposer mes meilleures sélections sans contraintes strictes")
    }

    message += alternatives.join('\n')
    message += "\n\nQuel critère souhaiteriez-vous ajuster pour que je puisse vous proposer des chocolats exceptionnels ?"

    return message
  }
}