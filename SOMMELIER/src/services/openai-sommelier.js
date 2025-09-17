import OpenAI from 'openai'
import { EnhancedSommelier } from './enhanced-sommelier'

export class OpenAISommelier extends EnhancedSommelier {
  constructor() {
    super()

    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
      this.useOpenAI = true
    } else {
      this.useOpenAI = false
      console.log('⚠️ OpenAI API key not found, using local sommelier')
    }
  }

  async processUserMessage({ message, currentPreferences, conversationHistory }) {
    // If no OpenAI, use parent class logic
    if (!this.useOpenAI) {
      return super.processUserMessage({ message, currentPreferences, conversationHistory })
    }

    try {
      // Check if user is asking for details about a specific chocolate
      const isDetailRequest = this.detectDetailRequest(message, conversationHistory)

      // Prepare conversation context
      const systemPrompt = isDetailRequest
        ? this.createDetailSystemPrompt(message, conversationHistory)
        : this.createStandardSystemPrompt(currentPreferences)

      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        })),
        { role: 'user', content: message }
      ]

      // Get AI response with adjusted parameters for detail requests
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        temperature: 0.7,
        max_tokens: isDetailRequest ? 800 : 300
      })

      const rawResponse = completion.choices[0].message.content
      const aiResponse = this.cleanMarkdownFormatting(rawResponse)

      // Extract preferences from user message using enhanced extraction
      const extractedPreferences = this.extractPreferencesEnhanced(message)
      const updatedPreferences = { ...currentPreferences, ...extractedPreferences }

      // ONLY get recommendations if we have ALL required preferences
      let recommendations = []
      const missingInfo = this.getMissingPreferences(updatedPreferences)

      if (missingInfo.length === 0) {
        // We have everything, make recommendations
        recommendations = this.findRecommendationsEnhanced(updatedPreferences)
      } else {
        // Still missing info, no recommendations yet
        recommendations = []
      }

      return {
        message: aiResponse,
        preferences: updatedPreferences,
        recommendations: recommendations.slice(0, 6)
      }

    } catch (error) {
      console.error('OpenAI API error:', error)
      // Fallback to local sommelier
      return super.processUserMessage({ message, currentPreferences, conversationHistory })
    }
  }

  detectDetailRequest(message, conversationHistory) {
    const detailKeywords = [
      'détail', 'détails', 'plus d\'info', 'informations', 'en savoir plus',
      'parle moi', 'expliquer', 'description', 'caractéristiques',
      'fabrication', 'histoire', 'producteur', 'méthode', 'terroir',
      'notes de dégustation', 'profile', 'goût', 'arôme', 'texture'
    ]

    const chocolateKeywords = [
      'alegria', 'chocolat', 'tablette', 'cacao', 'fève',
      'madagascar', 'venezuela', 'équateur', 'pérou', 'brasil'
    ]

    const messageWords = message.toLowerCase()

    const hasDetailKeyword = detailKeywords.some(keyword =>
      messageWords.includes(keyword.toLowerCase())
    )

    const hasChocolateKeyword = chocolateKeywords.some(keyword =>
      messageWords.includes(keyword.toLowerCase())
    )

    // Also check if there were recent recommendations in conversation
    const hasRecentRecommendations = conversationHistory.some(msg =>
      msg.type === 'assistant' && msg.content.toLowerCase().includes('recommandation')
    )

    return hasDetailKeyword && (hasChocolateKeyword || hasRecentRecommendations)
  }

  createDetailSystemPrompt(message, conversationHistory) {
    // Find chocolate mentioned in the message or recent recommendations
    const chocolateName = this.extractChocolateName(message, conversationHistory)
    const chocolate = this.findChocolateByName(chocolateName)

    return `Tu es un sommelier expert en chocolat pour XOCOA. L'utilisateur demande des détails approfondis sur un chocolat spécifique.

CHOCOLAT DEMANDÉ: ${chocolateName}
${chocolate ? `DONNÉES DU CHOCOLAT: ${JSON.stringify(chocolate, null, 2)}` : 'Chocolat non trouvé dans la base'}

RÉPONSE DÉTAILLÉE OBLIGATOIRE - Inclure TOUTES ces sections:

1. **CARACTÉRISTIQUES PRINCIPALES**
   - Pourcentage de cacao exact
   - Origine géographique précise (région/plantation si disponible)
   - Type de fèves utilisées

2. **PROFIL GUSTATIF COMPLET**
   - Notes de tête (premières impressions)
   - Notes de cœur (développement en bouche)
   - Notes de fin (persistance)
   - Texture et fondant

3. **TERROIR ET PRODUCTEUR**
   - Histoire de la plantation/région
   - Méthodes de culture et récolte
   - Processus de fermentation unique
   - Philosophie du chocolatier

4. **PROCESSUS DE FABRICATION**
   - Méthode de torréfaction
   - Temps de conchage
   - Techniques spéciales utilisées
   - Particularités du process

5. **EXPÉRIENCE DE DÉGUSTATION**
   - Température idéale de service
   - Accords recommandés (vins, thés, spiritueux)
   - Moment optimal de dégustation
   - Techniques de dégustation

6. **ENGAGEMENT ÉTHIQUE**
   - Pratiques durables
   - Commerce équitable
   - Impact social/environnemental
   - Certifications

Ton: Expert passionné, très détaillé, éducatif. AUCUN émoji.
Longueur: Réponse riche et complète, minimum 500 mots.`
  }

  createStandardSystemPrompt(currentPreferences) {
    return `Tu es un sommelier expert en chocolat pour XOCOA. Tu as accès à une base de données de ${this.chocolates.length} chocolats fins.

COMPORTEMENT OBLIGATOIRE:
1. AVANT recommandations: poser UNE SEULE question à la fois pour les 5 critères
2. APRÈS recommandations: continuer la conversation naturellement
3. Gérer les remerciements, demandes d'info, modifications de critères
4. NE JAMAIS inventer de chocolats - les cartes sont automatiques
5. Ton raffiné et professionnel, SANS émojis
6. Proposer d'affiner la recherche après recommandations

QUESTIONS À POSER DANS L'ORDRE:
1. Pourcentage cacao (50-60% doux, 70-75% équilibré, 80%+ intense)
2. Profil saveurs (fruité, épicé, floral, terreux, noisette, caramel)
3. Origine (Amérique du Sud, Afrique, Asie, ou pays spécifique)
4. Budget (économique <10$, standard 10-20$, premium >20$)
5. Occasion (cadeau, dégustation, cuisine, occasion spéciale)

Préférences reçues: ${JSON.stringify(currentPreferences)}
Il manque: ${JSON.stringify(this.getMissingPreferences(currentPreferences))}

Si tout est reçu: dire "Parfait ! Voici ma sélection personnalisée pour vous."
Si conversation après recommandations: répondre aux questions, proposer modifications, continuer le dialogue`
  }

  extractChocolateName(message, conversationHistory) {
    // Try to find chocolate name in current message first
    const messageWords = message.toLowerCase()

    // Check for explicit chocolate names
    const chocolateNames = this.chocolates.map(c => c.name.toLowerCase())
    const foundName = chocolateNames.find(name =>
      messageWords.includes(name) || name.includes(messageWords.split(' ')[0])
    )

    if (foundName) {
      return this.chocolates.find(c => c.name.toLowerCase() === foundName)?.name
    }

    // Look in recent conversation for context
    const recentMessages = conversationHistory.slice(-5)
    for (const msg of recentMessages.reverse()) {
      if (msg.type === 'assistant') {
        const foundInHistory = chocolateNames.find(name =>
          msg.content.toLowerCase().includes(name)
        )
        if (foundInHistory) {
          return this.chocolates.find(c => c.name.toLowerCase() === foundInHistory)?.name
        }
      }
    }

    return 'chocolat demandé'
  }

  findChocolateByName(chocolateName) {
    if (!chocolateName || chocolateName === 'chocolat demandé') return null

    return this.chocolates.find(chocolate =>
      chocolate.name.toLowerCase().includes(chocolateName.toLowerCase()) ||
      chocolateName.toLowerCase().includes(chocolate.name.toLowerCase())
    )
  }

  cleanMarkdownFormatting(text) {
    if (!text) return text

    return text
      // Remove bold markdown (**text**)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Remove bullet points with asterisks and replace with dashes
      .replace(/^\s*\*\s+/gm, '- ')
      // Remove remaining standalone asterisks
      .replace(/\*/g, '')
      // Clean up extra line breaks
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }
}