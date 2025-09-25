const OpenAI = require('openai')
const fs = require('fs')
const path = require('path')

class SmartHybridSommelier {
  constructor() {
    this.chocolates = []
    this.filters = {}
    this.loadData()

    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
      this.useOpenAI = true
    } else {
      this.useOpenAI = false
      throw new Error('❌ OpenAI API key required for Smart Hybrid Sommelier')
    }
  }

  loadData() {
    try {
      const chocolatesPath = path.join(process.cwd(), 'data', 'chocolates.json')
      const filtersPath = path.join(process.cwd(), 'data', 'filters.json')

      this.chocolates = JSON.parse(fs.readFileSync(chocolatesPath, 'utf8'))
      this.filters = JSON.parse(fs.readFileSync(filtersPath, 'utf8'))

      console.log(`✅ Loaded ${this.chocolates.length} chocolates for Smart Hybrid Sommelier`)
    } catch (error) {
      console.error('❌ Error loading chocolate data:', error)
      throw error
    }
  }

  async processUserMessage({ message, currentPreferences, conversationHistory }) {
    try {
      // ÉTAPE 1: OpenAI analyse et extrait les critères
      const extractedCriteria = await this.extractCriteriaWithAI(message, currentPreferences, conversationHistory)

      // ÉTAPE 2: Code local fait le filtrage rapide
      const filteredChocolates = this.filterChocolates(extractedCriteria)
      const count = filteredChocolates.length

      // ÉTAPE 3: OpenAI décide de la suite selon le workflow
      return await this.makeDecisionWithAI(message, extractedCriteria, filteredChocolates, count, conversationHistory)

    } catch (error) {
      console.error('Smart Hybrid processing error:', error)
      throw new Error(`Processing failed: ${error.message}`)
    }
  }

  // ÉTAPE 1: OpenAI extrait les critères avec validation stricte
  async extractCriteriaWithAI(message, currentPreferences, conversationHistory) {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert sommelier qui comprend les demandes chocolat naturellement.

MISSION: Comprends le message utilisateur et extrais les critères de recherche intelligemment.

DONNÉES DISPONIBLES POUR LA RECHERCHE:
- Origines: ${this.filters.origin_countrys?.slice(0, 20).join(', ')}...
- Chocolatiers: ${this.filters.maker_countrys?.slice(0, 10).join(', ')}...
- Types: ${this.filters.types?.join(', ')}
- Variétés: ${this.filters.bean_varietys?.join(', ')}
- Cépages: ${this.filters.wine_pairings?.slice(0, 10).join(', ')}...
- Spiritueux: ${this.filters.spirit_pairings?.slice(0, 8).join(', ')}...
- Awards: ${this.filters.awardss?.slice(0, 8).join(', ')}...

TON RÔLE:
- Traduis naturellement (Pérou→Peru, vanille→vanilla)
- Comprends les contextes (bourgogne→Pinot Noir ou demande clarification)
- Comprends "awards", "prix", "récompense" → utilise champ awards
- Comprends "années 2020", "2021", etc. → utilise awards_year
- CONSERVE TOUJOURS les préférences actuelles et AJOUTE les nouvelles
- Extrais les critères pertinents

RETOUR JSON:
{
  "criteria": {
    "origin_country": "pays_traduit_ou_null",
    "maker_country": "pays_traduit_ou_null",
    "cocoa_percentage_min": number_or_null,
    "cocoa_percentage_max": number_or_null,
    "flavor_keywords": ["mots_traduits_en_anglais"],
    "price_max": number_or_null,
    "type": "type_ou_null",
    "bean_variety": "variété_ou_null",
    "wine_pairing": "cépage_ou_null",
    "spirit_pairing": "spiritueux_ou_null",
    "awards": "award_recherché_ou_null",
    "awards_year": "année_award_ou_null"
  },
  "unrecognized_terms": ["seulement_termes_vraiment_incompris"],
  "confidence": "high/medium/low"
}`
        },
        {
          role: 'user',
          content: `PRÉFÉRENCES ACTUELLES: ${JSON.stringify(currentPreferences)}
NOUVEAU MESSAGE: "${message}"`
        }
      ],
      temperature: 0.3,
      max_tokens: 300
    })

    // Parse et merge avec préférences actuelles
    let result
    try {
      const content = completion.choices[0].message.content
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { criteria: {}, confidence: "low" }
    } catch (e) {
      result = { criteria: {}, confidence: "low" }
    }

    // Merge avec préférences existantes
    const mergedCriteria = { ...currentPreferences, ...result.criteria }

    return {
      ...result,
      criteria: mergedCriteria
    }
  }

  // ÉTAPE 2: Filtrage local rapide et précis avec accords
  filterChocolates(extractedCriteria) {
    const criteria = extractedCriteria.criteria
    let filtered = [...this.chocolates]

    // Filtrage par origine
    if (criteria.origin_country) {
      filtered = filtered.filter(c =>
        c.origin_country && c.origin_country.toLowerCase().includes(criteria.origin_country.toLowerCase())
      )
    }

    // Filtrage par chocolatier
    if (criteria.maker_country) {
      filtered = filtered.filter(c =>
        c.maker_country && c.maker_country.toLowerCase().includes(criteria.maker_country.toLowerCase())
      )
    }

    // Filtrage par pourcentage cacao
    if (criteria.cocoa_percentage_min) {
      filtered = filtered.filter(c =>
        c.cocoa_percentage && c.cocoa_percentage >= criteria.cocoa_percentage_min
      )
    }
    if (criteria.cocoa_percentage_max) {
      filtered = filtered.filter(c =>
        c.cocoa_percentage && c.cocoa_percentage <= criteria.cocoa_percentage_max
      )
    }

    // Filtrage par saveurs
    if (criteria.flavor_keywords && criteria.flavor_keywords.length > 0) {
      filtered = filtered.filter(c => {
        const allFlavors = [
          c.flavor_notes_primary || '',
          c.flavor_notes_secondary || '',
          c.flavor_notes_tertiary || ''
        ].join(' ').toLowerCase()

        return criteria.flavor_keywords.some(keyword =>
          allFlavors.includes(keyword.toLowerCase())
        )
      })
    }

    // Filtrage par accords vins (cépages)
    if (criteria.wine_pairing) {
      filtered = filtered.filter(c =>
        c.pairings_wine && c.pairings_wine.toLowerCase().includes(criteria.wine_pairing.toLowerCase())
      )
    }

    // Filtrage par accords spiritueux
    if (criteria.spirit_pairing) {
      filtered = filtered.filter(c =>
        c.pairings_spirits && c.pairings_spirits.toLowerCase().includes(criteria.spirit_pairing.toLowerCase())
      )
    }

    // Filtrage par prix
    if (criteria.price_max) {
      filtered = filtered.filter(c =>
        c.price_retail && parseFloat(c.price_retail) <= criteria.price_max
      )
    }

    // Filtrage par type
    if (criteria.type) {
      filtered = filtered.filter(c =>
        c.type && c.type.toLowerCase().includes(criteria.type.toLowerCase())
      )
    }

    // Filtrage par variété de fève
    if (criteria.bean_variety) {
      filtered = filtered.filter(c =>
        c.bean_variety && c.bean_variety.toLowerCase().includes(criteria.bean_variety.toLowerCase())
      )
    }

    // Filtrage par awards
    if (criteria.awards) {
      filtered = filtered.filter(c =>
        c.awards && c.awards.toLowerCase().includes(criteria.awards.toLowerCase())
      )
    }

    // Filtrage par année d'award
    if (criteria.awards_year) {
      filtered = filtered.filter(c =>
        c.awards_year && c.awards_year.includes(criteria.awards_year)
      )
    }

    // Tri par rating décroissant
    filtered.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))

    return filtered
  }

  // ÉTAPE 3: OpenAI décide de la suite selon le workflow
  async makeDecisionWithAI(originalMessage, extractedCriteria, filteredChocolates, count, conversationHistory) {
    // Analyser les options disponibles dans les chocolats filtrés
    const availableOptions = this.analyzeAvailableOptions(filteredChocolates)

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Tu es le sommelier XOCOA qui applique le WORKFLOW INTELLIGENT avec validation stricte.

${extractedCriteria.unrecognized_terms && extractedCriteria.unrecognized_terms.length > 0 ?
`TERMES NON RECONNUS: ${extractedCriteria.unrecognized_terms.join(', ')}
→ Tu DOIS mentionner ces termes et proposer les alternatives disponibles` : ''}

WORKFLOW:
- Si termes non reconnus → Expliquer + proposer alternatives
- Si 0 chocolats → Propose d'assouplir un critère
- Si 1-6 chocolats → RECOMMANDATIONS FINALES
- Si 7+ chocolats → DEMANDE UN CRITÈRE SUPPLÉMENTAIRE

CRITÈRES VALIDÉS: ${JSON.stringify(extractedCriteria.criteria)}
RÉSULTATS: ${count} chocolats trouvés

${count > 6 ? `OPTIONS DISPONIBLES DANS LES ${count} CHOCOLATS:
- Origines: ${availableOptions.origins.slice(0, 8).join(', ')}
- Prix: ${availableOptions.price_range}
- Pourcentages: ${availableOptions.cocoa_range}
- Types: ${availableOptions.types.slice(0, 5).join(', ')}
- Saveurs spécifiques disponibles: ${availableOptions.available_flavors?.slice(0, 8).join(', ') || 'aucune'}
- Cépages disponibles: ${availableOptions.wine_pairings?.slice(0, 6).join(', ') || 'aucun'}
- Spiritueux disponibles: ${availableOptions.spirit_pairings?.slice(0, 6).join(', ') || 'aucun'}` : ''}

ALTERNATIVES POUR TERMES NON RECONNUS:
- Pour les vins: nos CÉPAGES sont ${this.filters.wine_pairings?.slice(0, 10).join(', ')}
- Pour les saveurs: ${count > 6 ? `dans ces ${count} chocolats nous avons ${availableOptions.available_flavors?.slice(0, 6).join(', ') || 'aucune'}` : `nos mots-clés sont en anglais (apricot, cherry, vanilla...)`}
- Pour les origines: ${this.filters.origin_countries?.slice(0, 10).join(', ')}

RETOUR JSON:
{
  "message": "ta réponse conversationnelle",
  "preferences": ${JSON.stringify(extractedCriteria.criteria)},
  "recommendations": ${count <= 6 ? "array des chocolats" : "[]"},
  "debug_count": ${count}
}`
        },
        {
          role: 'user',
          content: `MESSAGE: "${originalMessage}"
RÉSULTATS: ${count} chocolats

${count <= 6 && count > 0 ? `CHOCOLATS TROUVÉS:
${JSON.stringify(filteredChocolates.slice(0, 6), null, 2)}` : ''}`
        }
      ],
      temperature: 0.8,
      max_tokens: 800
    })

    // Parse response
    let result
    try {
      const content = completion.choices[0].message.content
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      } else {
        result = {
          message: content,
          preferences: extractedCriteria.criteria,
          recommendations: count <= 6 ? filteredChocolates.slice(0, 6) : [],
          debug_count: count
        }
      }
    } catch (e) {
      result = {
        message: completion.choices[0].message.content,
        preferences: extractedCriteria.criteria,
        recommendations: count <= 6 ? filteredChocolates.slice(0, 6) : [],
        debug_count: count
      }
    }

    // S'assurer que les recommandations sont incluses si ≤6
    if (count <= 6 && count > 0 && (!result.recommendations || result.recommendations.length === 0)) {
      result.recommendations = filteredChocolates.slice(0, count)
    }

    // Traduire les tasting notes et expert reviews si on a des recommandations finales
    if (result.recommendations && result.recommendations.length > 0) {
      result.recommendations = await this.translateRecommendations(result.recommendations)
    }

    return result
  }

  // Traduire les tasting notes et expert reviews en français
  async translateRecommendations(chocolates) {
    try {
      // Optimisation: utiliser gpt-4o-mini pour les traductions (plus rapide et moins cher)
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert traducteur sommelier français. Ta mission est de traduire les tasting notes et expert reviews de l'anglais vers le français de manière naturelle et élégante.

RÈGLES DE TRADUCTION:
- Garde le style professionnel et poétique des descriptions
- Utilise un vocabulaire français raffiné pour les saveurs
- Traduis naturellement : "dominant notes" → "notes dominantes", "emerge" → "se révèlent"
- Conserve l'expertise technique tout en étant accessible
- Garde la structure et le sens exact

RETOUR JSON avec les traductions:`
          },
          {
            role: 'user',
            content: `Traduis les tasting_notes et expert_review de ces chocolats en français :

${JSON.stringify(chocolates.slice(0, 5).map(c => ({
  id: c.id,
  name: c.name,
  tasting_notes: c.tasting_notes,
  expert_review: c.expert_review
})), null, 2)}

RETOUR OBLIGATOIRE: JSON array avec same structure mais tasting_notes et expert_review traduits en français`
          }
        ],
        temperature: 0.3,
        max_tokens: 600
      })

      // Parse la réponse d'OpenAI
      let translatedData
      try {
        const content = completion.choices[0].message.content
        const jsonMatch = content.match(/\[[^\]]*\]/s)
        translatedData = jsonMatch ? JSON.parse(jsonMatch[0]) : []
      } catch (e) {
        console.error('Erreur parsing traduction:', e)
        return chocolates // Return original si erreur de traduction
      }

      // Merger les traductions avec les chocolats originaux
      const translatedChocolates = chocolates.map(chocolate => {
        const translation = translatedData.find(t => t.id === chocolate.id)
        if (translation) {
          return {
            ...chocolate,
            tasting_notes: translation.tasting_notes || chocolate.tasting_notes,
            expert_review: translation.expert_review || chocolate.expert_review
          }
        }
        return chocolate
      })

      return translatedChocolates
    } catch (error) {
      console.error('Erreur traduction OpenAI:', error)
      return chocolates // Return original si erreur
    }
  }

  // Analyser les options disponibles dans un sous-ensemble
  analyzeAvailableOptions(chocolates) {
    const origins = [...new Set(chocolates.map(c => c.origin_country).filter(Boolean))].slice(0, 10)
    const types = [...new Set(chocolates.map(c => c.type).filter(Boolean))].slice(0, 5)
    const prices = chocolates.map(c => parseFloat(c.price_retail)).filter(p => p > 0)
    const cocoaPercentages = chocolates.map(c => c.cocoa_percentage).filter(Boolean)

    // Extraire les accords disponibles
    const wine_pairings = [...new Set(
      chocolates
        .map(c => c.pairings_wine?.split(', ') || [])
        .flat()
        .map(w => w?.trim())
        .filter(Boolean)
    )].slice(0, 8)

    const spirit_pairings = [...new Set(
      chocolates
        .map(c => c.pairings_spirits?.split(', ') || [])
        .flat()
        .map(s => s?.trim())
        .filter(Boolean)
    )].slice(0, 6)

    // Extraire les saveurs disponibles avec comptage
    const flavorCounts = {}
    chocolates.forEach(c => {
      const allFlavors = [
        c.flavor_notes_primary || '',
        c.flavor_notes_secondary || '',
        c.flavor_notes_tertiary || ''
      ].join(', ').split(',').map(f => f.trim().toLowerCase()).filter(Boolean)

      allFlavors.forEach(flavor => {
        if (flavor.length > 2) { // Ignorer les mots trop courts
          flavorCounts[flavor] = (flavorCounts[flavor] || 0) + 1
        }
      })
    })

    // Trier par fréquence et garder les plus populaires
    const available_flavors = Object.entries(flavorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([flavor, count]) => `${flavor} (${count})`)

    return {
      origins,
      types,
      price_range: prices.length ? `${Math.min(...prices).toFixed(2)}€ - ${Math.max(...prices).toFixed(2)}€` : '',
      cocoa_range: cocoaPercentages.length ? `${Math.min(...cocoaPercentages)}% - ${Math.max(...cocoaPercentages)}%` : '',
      wine_pairings,
      spirit_pairings,
      available_flavors
    }
  }
}

module.exports = { SmartHybridSommelier }