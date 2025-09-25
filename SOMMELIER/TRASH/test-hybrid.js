// Test rapide de l'architecture hybride
import { HybridOpenAISommelier } from './src/services/hybrid-openai-sommelier.js'

async function testHybridSommelier() {
  console.log('🧪 Test de l\'architecture hybride XOCOA')

  const sommelier = new HybridOpenAISommelier()

  // Test 1: Message de découverte (devrait poser une question)
  console.log('\n📝 Test 1: Message de découverte')
  try {
    const result1 = await sommelier.processUserMessage({
      message: "Je veux découvrir le chocolat",
      currentPreferences: {},
      conversationHistory: []
    })

    console.log('Réponse:', result1.message)
    console.log('Préférences extraites:', result1.preferences)
    console.log('Recommandations:', result1.recommendations.length)
  } catch (error) {
    console.log('Erreur (mode local attendu):', error.message)
  }

  // Test 2: Message avec critères précis (devrait faire une recherche)
  console.log('\n📝 Test 2: Message avec critères précis')
  try {
    const result2 = await sommelier.processUserMessage({
      message: "Chocolat noir 70% fruité Madagascar pour cadeau budget 25€",
      currentPreferences: {},
      conversationHistory: [
        { type: 'user', content: 'Je veux découvrir le chocolat' }
      ]
    })

    console.log('Réponse:', result2.message.substring(0, 200) + '...')
    console.log('Préférences extraites:', result2.preferences)
    console.log('Recommandations:', result2.recommendations.length)
  } catch (error) {
    console.log('Erreur (mode local attendu):', error.message)
  }

  // Test 3: Test de la logique locale intelligente
  console.log('\n📝 Test 3: Logique locale intelligente')
  const preferences = {
    cocoa_percentage: ['medium'],
    flavor_profile: ['fruité'],
    budget: 20
  }

  const analysis = sommelier.analyzePreferences(preferences, [])
  console.log('Analyse des préférences:', analysis)

  const recommendations = sommelier.findRecommendationsLocal(preferences, 3)
  console.log('Recommandations trouvées:', recommendations.length)
  if (recommendations.length > 0) {
    console.log('Premier résultat:', {
      name: recommendations[0].name,
      maker: recommendations[0].maker_name,
      rating: recommendations[0].rating,
      price: recommendations[0].price_retail,
      score: recommendations[0].intelligentScore
    })
  }
}

testHybridSommelier().catch(console.error)