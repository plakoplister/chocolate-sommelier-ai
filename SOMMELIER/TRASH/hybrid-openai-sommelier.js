import OpenAI from 'openai'
import { IntelligentSommelier } from './intelligent-sommelier.js'

export class HybridOpenAISommelier extends IntelligentSommelier {
  constructor() {
    super()

    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
      this.useOpenAI = true
    } else {
      this.useOpenAI = false
      console.log('⚠️ OpenAI API key not found, using intelligent local sommelier')
    }
  }

  async processUserMessage({ message, currentPreferences, conversationHistory }) {
    // Si pas d'OpenAI, utiliser la logique locale intelligente
    if (!this.useOpenAI) {
      return await this.processWithLocalIntelligence({ message, currentPreferences, conversationHistory })
    }

    try {
      // ÉTAPE 1: OpenAI analyse le message et extrait les préférences
      const analysis = await this.analyzeMessageWithAI(message, conversationHistory, currentPreferences)

      // ÉTAPE 2: Si prêt pour la recherche, utiliser la logique locale rapide
      if (analysis.readyForSearch) {
        const recommendations = this.findRecommendationsLocal(analysis.extractedPreferences)

        // ÉTAPE 3: OpenAI présente les résultats naturellement
        return await this.presentRecommendationsWithAI(recommendations, message, analysis)
      }

      // Continue la conversation avec OpenAI
      return {
        message: analysis.conversationalResponse,
        preferences: analysis.extractedPreferences,
        recommendations: []
      }

    } catch (error) {
      console.error('OpenAI API error:', error)
      // Fallback vers logique locale intelligente
      return await this.processWithLocalIntelligence({ message, currentPreferences, conversationHistory })
    }
  }

  /**
   * ÉTAPE 1: Analyse du message par OpenAI
   */
  async analyzeMessageWithAI(message, conversationHistory, currentPreferences) {
    const systemPrompt = this.createAnalysisPrompt()

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: `PRÉFÉRENCES ACTUELLES: ${JSON.stringify(currentPreferences)}\nMESSAGE: ${message}` }
    ]

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500
    })

    let response
    try {
      const content = completion.choices[0].message.content
      // Try to parse as JSON first
      if (content.includes('{')) {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        response = jsonMatch ? JSON.parse(jsonMatch[0]) : { conversationalResponse: content }
      } else {
        response = { conversationalResponse: content }
      }
    } catch (e) {
      // Fallback to text response
      response = { conversationalResponse: completion.choices[0].message.content }
    }

    // Fusionner avec les préférences existantes
    const extractedPreferences = {
      ...currentPreferences,
      ...response.extractedPreferences
    }

    // Analyser avec la logique intelligente locale
    const intelligentAnalysis = this.analyzePreferences(extractedPreferences, conversationHistory)

    return {
      ...response,
      extractedPreferences,
      readyForSearch: intelligentAnalysis.readyForSearch,
      confidence: intelligentAnalysis.confidence,
      userExpertise: intelligentAnalysis.userExpertise
    }
  }

  /**
   * ÉTAPE 3: Présentation des recommandations par OpenAI
   */
  async presentRecommendationsWithAI(recommendations, originalMessage, analysis) {
    const searchContext = this.generateSearchContext(analysis.extractedPreferences, recommendations)
    const presentationPrompt = this.createPresentationPrompt(searchContext, analysis.userExpertise)

    const messages = [
      { role: 'system', content: presentationPrompt },
      { role: 'user', content: `MESSAGE ORIGINAL: "${originalMessage}"\n\nRECOMMANDATIONS TROUVÉES:\n${JSON.stringify(recommendations.slice(0, 3), null, 2)}` }
    ]

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.8,
      max_tokens: 600
    })

    return {
      message: completion.choices[0].message.content,
      preferences: analysis.extractedPreferences,
      recommendations: recommendations.slice(0, 5)
    }
  }

  /**
   * Prompt pour l'analyse intelligente des messages
   */
  createAnalysisPrompt() {
    return `Tu es un sommelier chocolat expert qui analyse les messages utilisateur pour extraire leurs préférences.

TA MISSION: Analyser le message et extraire PRÉCISÉMENT les préférences chocolat.

PRÉFÉRENCES À EXTRAIRE:
- cocoa_percentage: ["light" (32-60%), "medium" (65-75%), "dark" (80%+)] ou pourcentages exacts
- flavor_profile: ["fruité", "épicé", "floral", "terreux", "noisette", "vanillé", "chocolaté", "caramel"]
- origin_preference: ["Madagascar", "Venezuela", "Équateur", "Pérou", "Ghana", "Trinidad", etc.]
- budget: nombre en euros (ex: 25)
- occasion: "dégustation", "cadeau", "pâtisserie", "quotidien", "spécial"
- texture_preference: ["creamy", "smooth", "crisp", "grainy", "silky"]
- intensity: "low", "medium", "high"

EXPERTISE UTILISATEUR:
- "novice": mots comme "découvrir", "commencer", "débutant"
- "expert": mots comme "terroir", "fermentation", "criollo"
- "intermediate": par défaut

DÉTERMINER readyForSearch:
- true: si au moins 2 critères précis sont identifiés
- false: si informations insuffisantes, pose UNE question ciblée

RÉPONSE JSON OBLIGATOIRE:
{
  "extractedPreferences": {
    // préférences extraites
  },
  "readyForSearch": boolean,
  "conversationalResponse": "ta réponse naturelle si readyForSearch=false",
  "reasoning": "pourquoi tu as pris cette décision"
}

EXEMPLES:
Message: "Je veux découvrir le chocolat"
→ readyForSearch: false, pose question sur l'intensité préférée

Message: "Chocolat noir 70% fruité pour cadeau budget 20€"
→ readyForSearch: true, extrait tout

Sois naturel, expert et bienveillant dans tes réponses !`
  }

  /**
   * Prompt pour la présentation des recommandations
   */
  createPresentationPrompt(searchContext, userExpertise) {
    return `Tu es un sommelier chocolat expert de XOCOA qui présente des recommandations personnalisées.

CONTEXTE DE RECHERCHE:
- Critères utilisés: ${searchContext.searchCriteria.join(', ')}
- Résultats: ${searchContext.resultsSummary.count} chocolats trouvés
- Niveau utilisateur: ${userExpertise}
- Confiance: ${searchContext.confidence}

TON STYLE selon l'expertise:
- NOVICE: Explications simples, focus sur plaisir, rassurer
- EXPERT: Détails techniques, terroir, processus de fabrication
- INTERMEDIATE: Équilibre entre plaisir et connaissances

STRUCTURE DE RÉPONSE:
1. Accroche personnalisée basée sur leur demande
2. Présentation de 3 chocolats MAX avec:
   - Nom et maker
   - Pourquoi c'est parfait pour eux
   - 1-2 caractéristiques clés adaptées à leur niveau
3. Conseil de dégustation ou suggestion

STYLE:
- Chaleureux et expert
- Enthousiaste mais pas excessif
- Personnalisé selon leurs préférences exactes
- Français naturel

Évite les listes à puces, privilégie un discours fluide.
Ne mentionne PAS les scores techniques ou prix exactement, intègre-les naturellement.`
  }

  /**
   * Fallback: Traitement avec logique locale intelligente
   */
  async processWithLocalIntelligence({ message, currentPreferences, conversationHistory }) {
    // Extraction locale améliorée
    const extractedPreferences = this.extractPreferencesEnhanced(message)
    const updatedPreferences = { ...currentPreferences, ...extractedPreferences }

    // Analyse intelligente
    const analysis = this.analyzePreferences(updatedPreferences, conversationHistory)

    if (analysis.readyForSearch) {
      // Recherche locale
      const recommendations = this.findRecommendationsLocal(updatedPreferences)

      // Réponse locale intelligente
      const responseMessage = this.generateIntelligentResponse(recommendations, updatedPreferences, analysis.userExpertise)

      return {
        message: responseMessage,
        preferences: updatedPreferences,
        recommendations: recommendations.slice(0, 5)
      }
    }

    // Continue la conversation localement
    const nextQuestion = this.generateIntelligentQuestion(updatedPreferences, analysis.userExpertise)

    return {
      message: nextQuestion,
      preferences: updatedPreferences,
      recommendations: []
    }
  }

  /**
   * Génère une réponse intelligente locale pour les recommandations
   */
  generateIntelligentResponse(recommendations, preferences, expertise) {
    if (!recommendations.length) {
      return "Je n'ai pas trouvé de chocolats correspondant exactement à vos critères. Pouvez-vous ajuster votre budget ou vos préférences ?"
    }

    let response = ""

    // Accroche selon le contexte
    if (preferences.occasion === 'cadeau') {
      response += "Parfait pour un cadeau ! "
    } else if (preferences.expertise === 'novice') {
      response += "Excellente découverte en perspective ! "
    } else {
      response += "Voici ma sélection d'exception : "
    }

    // Présentation des chocolats
    recommendations.slice(0, 3).forEach((chocolate, index) => {
      const prefix = index === 0 ? "\n\n🍫 " : "\n\n🍫 "
      response += `${prefix}**${chocolate.name}** par ${chocolate.maker_name || 'Artisan'}`

      if (chocolate.origin_country) {
        response += ` (${chocolate.origin_country})`
      }

      response += ` - ${chocolate.cocoa_percentage}% cacao`

      if (chocolate.flavor_notes_primary) {
        response += `. Notes de ${chocolate.flavor_notes_primary.toLowerCase()}`
      }

      if (chocolate.price_retail) {
        response += ` - ${chocolate.price_retail}€`
      }
    })

    // Conseil final selon l'expertise
    if (expertise === 'novice') {
      response += "\n\nCommencez par le premier, il est parfait pour découvrir les saveurs authentiques !"
    } else if (expertise === 'expert') {
      response += "\n\nChacun révèle un terroir unique. Je recommande une dégustation comparative !"
    }

    return response
  }

  /**
   * Génère une question intelligente locale
   */
  generateIntelligentQuestion(preferences, expertise) {
    const missing = []

    if (!preferences.cocoa_percentage) missing.push('intensité')
    if (!preferences.flavor_profile) missing.push('profil aromatique')
    if (!preferences.budget) missing.push('budget')
    if (!preferences.occasion) missing.push('occasion')

    if (!missing.length) {
      return "Parfait ! Laissez-moi chercher les chocolats idéaux pour vous..."
    }

    const nextCriteria = missing[0]

    switch (nextCriteria) {
      case 'intensité':
        return expertise === 'novice'
          ? "Pour commencer, préférez-vous quelque chose de doux et crémeux, ou êtes-vous prêt(e) pour des saveurs plus intenses ?"
          : "Quelle intensité de cacao recherchez-vous ? Plutôt équilibré autour de 70%, ou plus corsé avec 80%+ ?"

      case 'profil aromatique':
        return "Côté saveurs, êtes-vous plutôt attiré(e) par des notes fruitées, épicées, ou peut-être quelque chose de plus terreux et authentique ?"

      case 'budget':
        return "Quel budget souhaitez-vous consacrer à cette découverte ? (15€, 25€, ou plus ?)"

      case 'occasion':
        return "C'est pour quelle occasion ? Dégustation personnelle, cadeau, ou pour accompagner un dessert ?"

      default:
        return "Dites-moi en plus sur vos goûts en chocolat !"
    }
  }
}