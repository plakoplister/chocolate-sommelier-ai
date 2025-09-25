const OpenAI = require('openai')
const fs = require('fs')
const path = require('path')

class PureOpenAISommelier {
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
      throw new Error('❌ OpenAI API key required for Pure OpenAI Sommelier')
    }
  }

  loadData() {
    try {
      const chocolatesPath = path.join(process.cwd(), 'data', 'chocolates.json')
      const filtersPath = path.join(process.cwd(), 'data', 'filters.json')

      this.chocolates = JSON.parse(fs.readFileSync(chocolatesPath, 'utf8'))
      this.filters = JSON.parse(fs.readFileSync(filtersPath, 'utf8'))

      console.log(`✅ Loaded ${this.chocolates.length} chocolates for Pure OpenAI Sommelier`)
    } catch (error) {
      console.error('❌ Error loading chocolate data:', error)
      throw error
    }
  }

  async processUserMessage({ message, currentPreferences, conversationHistory }) {
    if (!this.useOpenAI) {
      throw new Error('❌ OpenAI required - no local fallback available')
    }

    try {
      // 100% OpenAI - Pass ALL data and let OpenAI do everything
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: this.createMasterPrompt()
          },
          ...conversationHistory.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          {
            role: 'user',
            content: `PRÉFÉRENCES ACTUELLES: ${JSON.stringify(currentPreferences)}
MESSAGE UTILISATEUR: ${message}

DONNÉES DISPONIBLES:
FILTERS: ${JSON.stringify(this.filters)}

STRUCTURE DES CHOCOLATES (utilise cette structure pour filtrer parmi les ${this.chocolates.length}):
${JSON.stringify(this.chocolates[0], null, 2)}

EXEMPLE D'ORIGINES DISPONIBLES: ${[...new Set(this.chocolates.map(c => c.origin_country))].slice(0, 20).join(', ')}

INSTRUCTIONS OBLIGATOIRES:
1. Analyse le message utilisateur
2. Extrais les critères (origine, %, saveurs, etc.)
3. IMPORTANT: Tu dois RÉELLEMENT filtrer la base de ${this.chocolates.length} chocolats
4. Compte les résultats et indique le nombre dans debug_count
5. Applique le workflow selon le nombre de résultats

ATTENTION: Tu DOIS faire une vraie recherche dans les données, pas juste simuler !`
          }
        ],
        temperature: 0.8,
        max_tokens: 2000
      })

      // Parse OpenAI response
      const aiResponse = completion.choices[0].message.content

      // Try to extract JSON from response
      let result
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0])
        } else {
          // If no JSON structure, create one
          result = {
            message: aiResponse,
            preferences: currentPreferences,
            recommendations: []
          }
        }
      } catch (e) {
        // Fallback structure
        result = {
          message: aiResponse,
          preferences: currentPreferences,
          recommendations: []
        }
      }

      return result

    } catch (error) {
      console.error('OpenAI API error:', error)
      // NO LOCAL FALLBACK - return error
      throw new Error(`OpenAI processing failed: ${error.message}`)
    }
  }

  createMasterPrompt() {
    return `Tu es le sommelier chocolat expert de XOCOA avec accès à une base de ${this.chocolates.length} chocolats d'exception.

WORKFLOW INTELLIGENT - ÉTAPES OBLIGATOIRES:

1. EXTRACTION & VALIDATION:
   - Extrais les critères du message utilisateur
   - Vérifie chaque critère dans FILTERS.JSON
   - Si ambigu ou inexact, demande précision

2. RECHERCHE PROGRESSIVE:
   - Filtre les chocolats avec les critères validés
   - Compte les résultats

3. DÉCISION INTELLIGENTE:
   - Si 1-10 chocolats → RECOMMANDATIONS FINALES
   - Si 11+ chocolats → DEMANDE CRITÈRE SUPPLÉMENTAIRE
   - Si 0 chocolat → ASSOUPLIS un critère et propose alternatives

4. CHOIX DU PROCHAIN CRITÈRE (si >10 résultats):
   - Analyse les chocolats restants
   - Identifie les critères les plus discriminants (origine, %, prix, saveurs)
   - Propose les options disponibles dans ce sous-ensemble
   - Exemple: "Dans les chocolats fruitées, préférez-vous Madagascar (85 chocolats) ou Pérou (45 chocolats)?"

5. CRITÈRE D'ARRÊT:
   - ≤10 chocolats → STOP et recommande
   - 1 seul chocolat → PARFAIT, présente-le avec style
   - 0 chocolat → Propose d'assouplir un critère

CHAMPS DISPONIBLES:
- origin_country, maker_country
- cocoa_percentage (numerical)
- flavor_notes_primary/secondary/tertiary
- price_retail, type, bean_variety
- sustainability_certifications
- pairings_wine, pairings_spirits

RETOUR JSON OBLIGATOIRE:
{
  "message": "ta réponse conversationnelle",
  "preferences": { "critères_actuels": "valeurs" },
  "recommendations": [ /* chocolats si ≤10 résultats */ ],
  "debug_count": number_of_matching_chocolates
}

Sois méthodique, précis et expert !`
  }
}

module.exports = { PureOpenAISommelier }