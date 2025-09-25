const { ChocolateSommelier } = require('./chocolate-sommelier')

class IntelligentSommelier extends ChocolateSommelier {
  constructor() {
    super()

    // Seuils pour déterminer si on a assez d'infos pour chercher
    this.searchThreshold = {
      minCriteria: 2, // Au moins 2 critères identifiés
      preferredCriteria: 3 // Optimal avec 3+ critères
    }
  }

  /**
   * Analyse intelligente des préférences extraites
   */
  analyzePreferences(extractedPreferences, conversationHistory) {
    const criteriaCount = this.countValidCriteria(extractedPreferences)
    const userExpertise = this.detectUserExpertise(conversationHistory)

    return {
      criteriaCount,
      userExpertise,
      readyForSearch: criteriaCount >= this.searchThreshold.minCriteria,
      confidence: this.calculateConfidence(extractedPreferences, criteriaCount)
    }
  }

  /**
   * Compte les critères valides extraits
   */
  countValidCriteria(preferences) {
    let count = 0

    if (preferences.cocoa_percentage && preferences.cocoa_percentage.length > 0) count++
    if (preferences.flavor_profile && preferences.flavor_profile.length > 0) count++
    if (preferences.origin_preference && preferences.origin_preference.length > 0) count++
    if (preferences.budget && preferences.budget > 0) count++
    if (preferences.occasion && preferences.occasion.trim()) count++
    if (preferences.texture_preference && preferences.texture_preference.length > 0) count++
    if (preferences.intensity && preferences.intensity.trim()) count++

    return count
  }

  /**
   * Détecte le niveau d'expertise de l'utilisateur
   */
  detectUserExpertise(conversationHistory) {
    const allText = conversationHistory
      .filter(msg => msg.type === 'user')
      .map(msg => msg.content.toLowerCase())
      .join(' ')

    const expertKeywords = [
      'terroir', 'fermentation', 'conchage', 'torréfaction', 'criollo', 'trinitario',
      'forastero', 'single origin', 'bean to bar', 'pourcentage', 'cacao', 'fève'
    ]

    const noviceKeywords = [
      'découvrir', 'commencer', 'premier', 'débutant', 'simple', 'basique',
      'chocolat noir', 'chocolat au lait', 'pas trop fort', 'doux'
    ]

    const expertScore = expertKeywords.reduce((score, keyword) => {
      return allText.includes(keyword) ? score + 1 : score
    }, 0)

    const noviceScore = noviceKeywords.reduce((score, keyword) => {
      return allText.includes(keyword) ? score + 1 : score
    }, 0)

    if (expertScore >= 2) return 'expert'
    if (noviceScore >= 2) return 'novice'
    return 'intermediate'
  }

  /**
   * Calcule le niveau de confiance pour la recherche
   */
  calculateConfidence(preferences, criteriaCount) {
    if (criteriaCount >= 4) return 'high'
    if (criteriaCount >= 2) return 'medium'
    return 'low'
  }

  /**
   * Recherche locale optimisée dans la base de chocolats
   */
  findRecommendationsLocal(preferences, maxResults = 5) {
    let filtered = [...this.chocolates]
    let scoredChocolates = []

    // Filtrage par critères
    if (preferences.cocoa_percentage && preferences.cocoa_percentage.length > 0) {
      const percentages = Array.isArray(preferences.cocoa_percentage) ? preferences.cocoa_percentage : [preferences.cocoa_percentage]
      filtered = filtered.filter(chocolate => {
        const cocoaPercentage = parseInt(chocolate.cocoa_percentage)
        return percentages.some(range => {
          if (range === 'light') return cocoaPercentage >= 32 && cocoaPercentage <= 60
          if (range === 'medium') return cocoaPercentage >= 65 && cocoaPercentage <= 75
          if (range === 'dark') return cocoaPercentage >= 80 && cocoaPercentage <= 100
          return Math.abs(cocoaPercentage - parseInt(range)) <= 5
        })
      })
    }

    if (preferences.budget && preferences.budget > 0) {
      filtered = filtered.filter(chocolate => {
        const price = parseFloat(chocolate.price_retail)
        return price <= preferences.budget
      })
    }

    if (preferences.origin_preference && preferences.origin_preference.length > 0) {
      const origins = preferences.origin_preference.map(o => o.toLowerCase())
      filtered = filtered.filter(chocolate => {
        const origin = (chocolate.origin_country || '').toLowerCase()
        const region = (chocolate.origin_region || '').toLowerCase()
        return origins.some(pref => origin.includes(pref) || region.includes(pref))
      })
    }

    // Scoring intelligent
    scoredChocolates = filtered.map(chocolate => {
      let score = 0

      // Score par rating de base
      score += parseFloat(chocolate.rating || 0) * 20

      // Bonus pour les profils aromatiques correspondants
      if (preferences.flavor_profile && preferences.flavor_profile.length > 0) {
        const flavors = preferences.flavor_profile.map(f => f.toLowerCase())
        const chocolateFlavors = [
          chocolate.flavor_notes_primary || '',
          chocolate.flavor_notes_secondary || '',
          chocolate.flavor_notes_tertiary || ''
        ].join(' ').toLowerCase()

        flavors.forEach(flavor => {
          if (chocolateFlavors.includes(flavor)) score += 15
        })
      }

      // Bonus pour occasion appropriée
      if (preferences.occasion) {
        const occasion = preferences.occasion.toLowerCase()
        const servingOccasion = (chocolate.serving_occasion || '').toLowerCase()
        if (servingOccasion.includes(occasion)) score += 10
      }

      // Bonus pour texture préférée
      if (preferences.texture_preference && preferences.texture_preference.length > 0) {
        const textures = preferences.texture_preference.map(t => t.toLowerCase())
        const chocolateTexture = (chocolate.texture_mouthfeel || '').toLowerCase()
        textures.forEach(texture => {
          if (chocolateTexture.includes(texture)) score += 8
        })
      }

      // Malus pour les prix très élevés si budget serré
      if (preferences.budget && preferences.budget < 15) {
        const price = parseFloat(chocolate.price_retail || 0)
        if (price > preferences.budget * 0.8) score -= 5
      }

      return { ...chocolate, intelligentScore: score }
    })

    // Tri par score et sélection des meilleurs
    scoredChocolates.sort((a, b) => b.intelligentScore - a.intelligentScore)

    return scoredChocolates.slice(0, maxResults)
  }

  /**
   * Génère des informations contextuelles pour l'IA
   */
  generateSearchContext(preferences, recommendations) {
    return {
      searchCriteria: this.formatSearchCriteria(preferences),
      resultsSummary: this.formatResultsSummary(recommendations),
      userProfile: preferences.expertise || 'intermediate',
      confidence: this.calculateConfidence(preferences, this.countValidCriteria(preferences))
    }
  }

  formatSearchCriteria(preferences) {
    const criteria = []

    if (preferences.cocoa_percentage) {
      criteria.push(`Pourcentage cacao: ${preferences.cocoa_percentage.join(', ')}`)
    }
    if (preferences.flavor_profile) {
      criteria.push(`Profil aromatique: ${preferences.flavor_profile.join(', ')}`)
    }
    if (preferences.origin_preference) {
      criteria.push(`Origine: ${preferences.origin_preference.join(', ')}`)
    }
    if (preferences.budget) {
      criteria.push(`Budget max: ${preferences.budget}€`)
    }
    if (preferences.occasion) {
      criteria.push(`Occasion: ${preferences.occasion}`)
    }

    return criteria
  }

  formatResultsSummary(recommendations) {
    if (!recommendations.length) return "Aucun chocolat trouvé"

    const origins = [...new Set(recommendations.map(r => r.origin_country))].slice(0, 3)
    const avgRating = recommendations.reduce((sum, r) => sum + parseFloat(r.rating || 0), 0) / recommendations.length
    const priceRange = {
      min: Math.min(...recommendations.map(r => parseFloat(r.price_retail || 0))),
      max: Math.max(...recommendations.map(r => parseFloat(r.price_retail || 0)))
    }

    return {
      count: recommendations.length,
      topOrigins: origins,
      averageRating: avgRating.toFixed(1),
      priceRange
    }
  }

  /**
   * Extrait des préférences améliorées avec plus de contexte
   */
  extractPreferencesEnhanced(message) {
    const preferences = super.extractPreferences(message)
    const lowerMessage = message.toLowerCase()

    // Conversion des anciens champs vers nouveaux formats
    if (preferences.preferred_flavors) {
      preferences.flavor_profile = preferences.preferred_flavors
    }
    if (preferences.origin_country) {
      preferences.origin_preference = [preferences.origin_country]
    }

    // Conversion du pourcentage cacao en format attendu
    if (preferences.cocoa_percentage && typeof preferences.cocoa_percentage === 'number') {
      const percentage = preferences.cocoa_percentage
      if (percentage <= 60) {
        preferences.cocoa_percentage = ['light']
      } else if (percentage <= 75) {
        preferences.cocoa_percentage = ['medium']
      } else {
        preferences.cocoa_percentage = ['dark']
      }
    }

    // Détection d'intensité
    if (lowerMessage.includes('intense') || lowerMessage.includes('fort') || lowerMessage.includes('puissant')) {
      preferences.intensity = 'high'
      preferences.cocoa_percentage = preferences.cocoa_percentage || ['dark']
    }

    if (lowerMessage.includes('doux') || lowerMessage.includes('léger') || lowerMessage.includes('délicat')) {
      preferences.intensity = 'low'
      preferences.cocoa_percentage = preferences.cocoa_percentage || ['light']
    }

    // Détection de texture
    const textureKeywords = {
      'crémeux': 'creamy',
      'fondant': 'smooth',
      'croquant': 'crisp',
      'rugueux': 'grainy',
      'soyeux': 'silky'
    }

    Object.keys(textureKeywords).forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        preferences.texture_preference = preferences.texture_preference || []
        preferences.texture_preference.push(textureKeywords[keyword])
      }
    })

    // Détection de budget numérique
    const budgetMatch = lowerMessage.match(/(\d+)\s*€|budget\s+(\d+)|€\s*(\d+)|(\d+)\s*euro/)
    if (budgetMatch) {
      const budget = parseInt(budgetMatch[1] || budgetMatch[2] || budgetMatch[3] || budgetMatch[4])
      if (budget && budget > 0) {
        preferences.budget = budget
      }
    }

    // Détection d'expertise
    if (lowerMessage.includes('découvrir') || lowerMessage.includes('commencer') || lowerMessage.includes('débutant')) {
      preferences.expertise = 'novice'
    }
    if (lowerMessage.includes('expert') || lowerMessage.includes('connaisseur') || lowerMessage.includes('terroir')) {
      preferences.expertise = 'expert'
    }

    return preferences
  }
}

module.exports = { IntelligentSommelier }