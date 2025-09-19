import { useState, useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'
import FixedChatInput from './FixedChatInput'
import ChocolateRecommendations from '../Recommendations/ChocolateRecommendations'

// Helper function to get random items from array
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, array.length))
}

// Map continents to countries based on real geography
const getCountriesByContinent = (continent, allCountries) => {
  const continentMap = {
    'Africa': [
      'Ghana', 'Tanzania', 'Madagascar'
    ],
    'Asia': [
      'India', 'Indonesia', 'Philippines', 'Vietnam', 'Papua New Guinea'
    ],
    'South America': [
      'Brazil', 'Colombia', 'Ecuador', 'Peru', 'Venezuela'
    ],
    'Americas': [
      'Brazil', 'Colombia', 'Costa Rica', 'Dominican Republic', 'Ecuador',
      'Guatemala', 'Honduras', 'Jamaica', 'Mexico', 'Nicaragua', 'Peru',
      'Trinidad', 'Venezuela'
    ],
    'Oceania': [
      'Australia', 'Papua New Guinea'
    ]
  }

  const mappedCountries = continentMap[continent] || []
  // Filter to only include countries that exist in our data
  return allCountries.filter(country => mappedCountries.includes(country))
}

// Detect search type from initial response
const detectSearchType = (message) => {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('fabrication') || lowerMessage.includes('belgique') ||
      lowerMessage.includes('france') || lowerMessage.includes('suisse') ||
      lowerMessage.includes('chocolatier')) {
    return 'maker_focused'
  }

  if (lowerMessage.includes('fève') || lowerMessage.includes('madagascar') ||
      lowerMessage.includes('ghana') || lowerMessage.includes('ecuador') ||
      lowerMessage.includes('origine')) {
    return 'origin_focused'
  }

  if (lowerMessage.includes('tablette') || lowerMessage.includes('bonbon') ||
      lowerMessage.includes('truffe') || lowerMessage.includes('type')) {
    return 'type_focused'
  }

  if (lowerMessage.includes('doux') || lowerMessage.includes('noir') ||
      lowerMessage.includes('intense') || lowerMessage.includes('cacao') ||
      lowerMessage.includes('concentration') || lowerMessage.includes('%')) {
    return 'cocoa_focused'
  }

  if (lowerMessage.includes('fruit') || lowerMessage.includes('épice') ||
      lowerMessage.includes('floral') || lowerMessage.includes('saveur')) {
    return 'flavor_focused'
  }

  if (lowerMessage.includes('dégustation') || lowerMessage.includes('cadeau') ||
      lowerMessage.includes('occasion')) {
    return 'occasion_focused'
  }

  return 'general'
}

// Fixed logical order of questions based on search type
const getQuestionCategories = (searchType, expertiseLevel) => {
  const flows = {
    'maker_focused': [
      'maker_country',
      'cocoa_percentage',
      'flavor_profile',
      'price_range'
    ],
    'origin_focused': [
      'origin_continent',
      'origin_country',
      'cocoa_percentage',
      'flavor_profile',
      'price_range'
    ],
    'type_focused': [
      'type',
      'cocoa_percentage',
      'flavor_profile',
      'origin_country',
      'price_range'
    ],
    'cocoa_focused': [
      'cocoa_percentage',
      'flavor_profile',
      'origin_country',
      'price_range'
    ],
    'flavor_focused': [
      'flavor_profile',
      'cocoa_percentage',
      'origin_country',
      'price_range'
    ],
    'occasion_focused': [
      'occasion',
      'cocoa_percentage',
      'flavor_profile',
      'price_range'
    ],
    'general': [
      'cocoa_percentage',
      'flavor_profile',
      'origin_country',
      'price_range'
    ]
  }

  let flow = flows[searchType] || flows.general

  if (expertiseLevel === 'expert') {
    // Add expert questions
    flow = [...flow, 'bean_variety', 'certification']
  }

  return flow
}

// Detect if user seems to be a chocolate connoisseur
const detectExpertiseLevel = (message, conversationHistory) => {
  const expertTerms = [
    'criollo', 'trinitario', 'forastero', 'single origin', 'bean-to-bar',
    'conching', 'tempering', 'terroir', 'fermentation', 'notes de',
    'acidité', 'astringence', 'longueur en bouche', 'finale',
    'madagascar', 'venezuela', 'ecuador', 'pérou', 'ghana',
    'valrhona', 'bonnat', 'michel cluizel', 'pierre hermé',
    'cacao barry', 'callebaut', 'guittard', 'felchlin'
  ]

  const allMessages = conversationHistory.concat([{ content: message }])
  const allText = allMessages.map(msg => msg.content?.toLowerCase() || '').join(' ')

  const expertMatches = expertTerms.filter(term => allText.includes(term)).length
  return expertMatches >= 2 ? 'expert' : 'beginner'
}

// Use fixed logical order based on search type
const selectConversationCategories = (searchType, expertiseLevel) => {
  return getQuestionCategories(searchType, expertiseLevel)
}

// Client-side sommelier logic
const processMessageClientSide = async ({ message, currentPreferences, conversationHistory, chocolatesData, filtersData }) => {
  // Determine what category we're currently asking about
  let currentCategory = null
  if (currentPreferences.conversationCategories) {
    const missingCategories = currentPreferences.conversationCategories.filter(req =>
      !currentPreferences[req] || currentPreferences[req] === ''
    )
    currentCategory = missingCategories[0] || null
  }

  // Extract preferences from message
  const extractedPreferences = extractPreferencesFromMessage(message, filtersData, currentCategory)
  const updatedPreferences = { ...currentPreferences, ...extractedPreferences }

  // Initialize conversation categories if not set
  if (!updatedPreferences.conversationCategories) {
    // First message after welcome - detect search type
    if (conversationHistory.length <= 1) {
      const searchType = detectSearchType(message)
      updatedPreferences.searchType = searchType
      console.log(`🎯 Detected search type: ${searchType}`)
    }

    const expertiseLevel = detectExpertiseLevel(message, conversationHistory)
    updatedPreferences.conversationCategories = selectConversationCategories(
      updatedPreferences.searchType || 'general',
      expertiseLevel
    )
    updatedPreferences.expertiseLevel = expertiseLevel
  }

  // Check what's missing from this conversation's categories
  // Consider 'none' as answered, not missing
  const missingInfo = updatedPreferences.conversationCategories.filter(req =>
    !updatedPreferences[req] || updatedPreferences[req] === ''
  )

  // Check how many actual preferences (not 'none') we have
  const actualPreferences = updatedPreferences.conversationCategories.filter(req =>
    updatedPreferences[req] && updatedPreferences[req] !== 'none'
  ).length

  let responseMessage = ''
  let recommendations = []

  // Check if this is follow-up after recommendations
  const hasAllPreferences = missingInfo.length === 0
  const previouslyHadRecommendations = conversationHistory.some(msg =>
    msg.type === 'assistant' && (msg.content.includes('sélection') || msg.content.includes('recommandations'))
  )

  if (conversationHistory.length <= 1) {
    // Dynamic welcome message with first question
    const firstCategory = updatedPreferences.conversationCategories[0]
    responseMessage = `Bienvenue chez XOCOA. Pour vous recommander le chocolat parfait, j'aimerais connaître vos préférences. ${getDynamicQuestion(firstCategory, filtersData, updatedPreferences)}`
  } else if (previouslyHadRecommendations && hasAllPreferences) {
    // Continue conversation after recommendations
    responseMessage = handleFollowUpMessage(message, updatedPreferences)
    if (!isRequestingNewSearch(message)) {
      recommendations = findRecommendations(updatedPreferences, chocolatesData, filtersData)
    }
  } else if (missingInfo.length > 0) {
    responseMessage = getDynamicQuestion(missingInfo[0], filtersData, updatedPreferences)
  } else if (actualPreferences >= 2) {
    // We have enough actual preferences, make recommendations
    console.log('📌 MAKING RECOMMENDATIONS with preferences:', updatedPreferences)
    recommendations = findRecommendations(updatedPreferences, chocolatesData, filtersData)
    console.log('📌 Found recommendations:', recommendations.length)
    responseMessage = generateRecommendationMessage(recommendations, updatedPreferences)
  } else {
    // Not enough preferences, ask one more question
    const unansweredCategories = updatedPreferences.conversationCategories.filter(req =>
      !updatedPreferences[req] || updatedPreferences[req] === ''
    )
    if (unansweredCategories.length > 0) {
      responseMessage = getDynamicQuestion(unansweredCategories[0], filtersData, updatedPreferences)
    } else {
      // Fallback to recommendations even with few preferences
      console.log('📌 FALLBACK RECOMMENDATIONS with preferences:', updatedPreferences)
      recommendations = findRecommendations(updatedPreferences, chocolatesData, filtersData)
      console.log('📌 Found recommendations:', recommendations.length)
      responseMessage = generateRecommendationMessage(recommendations, updatedPreferences)
    }
  }

  return {
    message: responseMessage,
    preferences: updatedPreferences,
    recommendations: recommendations.slice(0, 6)
  }
}

const extractPreferencesFromMessage = (message, filtersData, currentCategory = null) => {
  const preferences = {}
  const lowerMessage = message.toLowerCase()

  console.log('🔤 Extracting preferences from message:', message)

  // Check for "skip" responses
  const skipResponses = [
    'aucun', 'aucune', 'non', 'pas de préférence', 'peu importe', 'indifférent',
    'je ne sais pas', 'pas d\'avis', 'n\'importe', 'skip', 'passer', 'suivant'
  ]

  const isSkipResponse = skipResponses.some(skip => lowerMessage.includes(skip))

  // If it's a skip response, only set the current category to 'none'
  if (isSkipResponse && currentCategory) {
    preferences[currentCategory] = 'none'
    console.log(`⏭️ Skipping current category: ${currentCategory}`)
    return preferences
  }

  // Cocoa percentage - NEW CATEGORIES (only when asking about cocoa percentage)
  if (currentCategory === 'cocoa_percentage') {
    if (lowerMessage.includes('très doux') || lowerMessage.includes('<40') || lowerMessage.includes('< 40')) {
      preferences.cocoa_percentage = '<40%'
    } else if (lowerMessage.includes('doux') && !lowerMessage.includes('très')) {
      preferences.cocoa_percentage = '40-50%'
    } else if (lowerMessage.includes('noir léger') || lowerMessage.includes('50-70')) {
      preferences.cocoa_percentage = '50-70%'
    } else if (lowerMessage.includes('noir') && !lowerMessage.includes('léger')) {
      preferences.cocoa_percentage = '70-85%'
    } else if (lowerMessage.includes('intense') || lowerMessage.includes('>85') || lowerMessage.includes('> 85')) {
      preferences.cocoa_percentage = '>85%'
    }
  }

  // Flavor profile - Check against actual flavors from filters (only when asking about flavor)
  if (currentCategory === 'flavor_profile' && filtersData && filtersData.flavors) {
    for (const flavor of filtersData.flavors) {
      const cleanFlavor = flavor.trim().toLowerCase()
      if (lowerMessage.includes(cleanFlavor) && cleanFlavor.length > 2) {
        preferences.flavor_profile = cleanFlavor
        console.log(`🍫 Detected flavor: ${cleanFlavor}`)
        break
      }
    }
    // If no flavor found, log it
    if (!preferences.flavor_profile) {
      console.log(`⚠️ No flavor detected in message: "${lowerMessage}"`)
    }
  }

  // Origin continent - NEW LOGIC (only when asking about continent)
  if (currentCategory === 'origin_continent') {
    if (lowerMessage.includes('afrique') || lowerMessage.includes('africa')) {
      preferences.origin_continent = 'Africa'
    } else if (lowerMessage.includes('asie') || lowerMessage.includes('asia')) {
      preferences.origin_continent = 'Asia'
    } else if (lowerMessage.includes('amérique du sud') || lowerMessage.includes('south america') ||
               lowerMessage.includes('amerique du sud') || lowerMessage.includes('sud-américain')) {
      preferences.origin_continent = 'South America'
    } else if (lowerMessage.includes('amérique') && !lowerMessage.includes('du sud') ||
               lowerMessage.includes('america') && !lowerMessage.includes('south')) {
      preferences.origin_continent = 'Americas'
    }
  }

  // Origin country - Check against actual countries from filters (only when asking about origin)
  if (currentCategory === 'origin_country' && filtersData && filtersData.origin_countries) {
    for (const country of filtersData.origin_countries) {
      if (lowerMessage.includes(country.toLowerCase())) {
        preferences.origin_country = country
        break
      }
    }
  }

  // Maker country - Check against actual maker countries (only when asking about maker)
  if (currentCategory === 'maker_country' && filtersData && filtersData.maker_countries) {
    for (const country of filtersData.maker_countries) {
      if (country !== 'Unknown' && lowerMessage.includes(country.toLowerCase())) {
        preferences.maker_country = country
        break
      }
    }
  }

  // Certifications (only when asking about certification)
  if (currentCategory === 'certification' && filtersData && filtersData.certifications) {
    for (const cert of filtersData.certifications) {
      if (lowerMessage.includes(cert.toLowerCase())) {
        preferences.certification = cert
        break
      }
    }
  }

  // Wine pairings
  if (filtersData && filtersData.wine_pairings) {
    for (const wine of filtersData.wine_pairings) {
      const cleanWine = wine.trim().toLowerCase()
      if (lowerMessage.includes(cleanWine)) {
        preferences.pairing = { type: 'wine', value: wine.trim() }
        break
      }
    }
  }

  // Spirit pairings
  if (!preferences.pairing && filtersData && filtersData.spirit_pairings) {
    for (const spirit of filtersData.spirit_pairings) {
      const cleanSpirit = spirit.trim().toLowerCase()
      if (lowerMessage.includes(cleanSpirit)) {
        preferences.pairing = { type: 'spirit', value: spirit.trim() }
        break
      }
    }
  }

  // Texture
  if (filtersData && filtersData.textures_mouthfeel) {
    for (const texture of filtersData.textures_mouthfeel) {
      if (lowerMessage.includes(texture.toLowerCase())) {
        preferences.texture = texture
        break
      }
    }
  }

  // Type of chocolate (tablet, bonbon, truffle, etc.)
  if (currentCategory === 'type' && filtersData && filtersData.types) {
    for (const type of filtersData.types) {
      if (lowerMessage.includes(type.toLowerCase())) {
        preferences.type = type
        console.log(`🍫 Detected chocolate type: ${type}`)
        break
      }
    }
  }

  // Bean variety
  if (filtersData && filtersData.bean_varieties) {
    for (const variety of filtersData.bean_varieties) {
      if (lowerMessage.includes(variety.toLowerCase())) {
        preferences.bean_variety = variety
        break
      }
    }
  }

  // Price range - NEW LOGIC (only when asking about price)
  if (currentCategory === 'price_range') {
    if (lowerMessage.includes('économique') || lowerMessage.includes('<15') ||
               lowerMessage.includes('< 15') || lowerMessage.includes('moins de 15') ||
               lowerMessage.includes('budget') || lowerMessage.includes('pas cher')) {
      preferences.price_range = 'economic'
    } else if (lowerMessage.includes('standard') || lowerMessage.includes('15-30') ||
               lowerMessage.includes('moyen') || lowerMessage.includes('normal')) {
      preferences.price_range = 'standard'
    } else if (lowerMessage.includes('premium') || lowerMessage.includes('>30') ||
               lowerMessage.includes('> 30') || lowerMessage.includes('plus de 30') ||
               lowerMessage.includes('haut de gamme') || lowerMessage.includes('luxe')) {
      preferences.price_range = 'premium'
    }
  }

  // Detect requests to relax criteria (ALWAYS CHECK, regardless of current category)
  // This should work even after recommendations are made
  if (lowerMessage.includes('sans le') || lowerMessage.includes('enlever') || lowerMessage.includes('retirer')) {
    console.log('🔓 DETECTED: Request to remove criteria')
    if (lowerMessage.includes('origine') || lowerMessage.includes('pays')) {
      preferences.remove_origin = true
      console.log('   → Removing origin criteria')
    }
    if (lowerMessage.includes('saveur') || lowerMessage.includes('goût')) {
      preferences.remove_flavor = true
      console.log('   → Removing flavor criteria')
    }
    if (lowerMessage.includes('cacao') || lowerMessage.includes('pourcentage')) {
      preferences.remove_cocoa = true
      console.log('   → Removing cocoa criteria')
    }
    if (lowerMessage.includes('chocolatier') || lowerMessage.includes('fabricant')) {
      preferences.remove_maker = true
      console.log('   → Removing maker criteria')
    }
    if (lowerMessage.includes('certification')) {
      preferences.remove_certification = true
      console.log('   → Removing certification criteria')
    }
  }

  if (lowerMessage.includes('élargir') || lowerMessage.includes('assouplir')) {
    console.log('🔓 DETECTED: Request to expand criteria')
    if (lowerMessage.includes('saveur') || lowerMessage.includes('goût')) {
      preferences.expand_flavor = true
      console.log('   → Expanding flavor criteria')
    }
    if (lowerMessage.includes('origine') || lowerMessage.includes('pays')) {
      preferences.expand_origin = true
      console.log('   → Expanding origin criteria')
    }
  }

  // Keep occasion for backward compatibility
  if (lowerMessage.includes('cadeau') || lowerMessage.includes('offrir')) {
    preferences.occasion = 'cadeau'
  } else if (lowerMessage.includes('dégustation') || lowerMessage.includes('personnel')) {
    preferences.occasion = 'dégustation'
  }

  console.log('✅ Extracted preferences:', preferences)

  return preferences
}

// Generate dynamic questions based on category and available data
const getDynamicQuestion = (category, filtersData, userPreferences = {}) => {
  switch (category) {
    case 'cocoa_percentage':
      return "Quel pourcentage de cacao préférez-vous ? Très doux (<40%), doux (40-50%), noir léger (50-70%), noir (70-85%), ou intense (>85%) ?"

    case 'flavor_profile':
      // Pick 10 random flavors from the list
      const randomFlavors = getRandomItems(filtersData.flavors.filter(f => !f.startsWith(' ')), 10)
      const flavorGroups = [
        randomFlavors.slice(0, 3).join(', '),
        randomFlavors.slice(3, 6).join(', '),
        randomFlavors.slice(6, 10).join(', ')
      ]
      return `Quelles saveurs vous attirent le plus ? Par exemple : ${flavorGroups.join(' ? Ou peut-être ')} ?`

    case 'origin_continent':
      return "Quelle région d'origine du cacao vous intéresse ? Afrique, Asie, ou Amérique du Sud ?"

    case 'origin_country':
      // Filter countries based on selected continent
      if (userPreferences.origin_continent && userPreferences.origin_continent !== 'none') {
        const continentCountries = getCountriesByContinent(userPreferences.origin_continent, filtersData.origin_countries)
        if (continentCountries.length > 0) {
          const randomCountries = getRandomItems(continentCountries, Math.min(6, continentCountries.length))
          return `Quel pays d'origine du cacao de ${userPreferences.origin_continent.toLowerCase()} vous intéresse ? ${randomCountries.join(', ')} ?`
        }
      }
      // Fallback if no continent selected or no countries found
      const randomCountries = getRandomItems(filtersData.origin_countries, 6)
      return `Dans quel pays d'origine du cacao spécifiquement ? ${randomCountries.join(', ')} ?`

    case 'maker_country':
      // Pick 5 random maker countries
      const randomMakers = getRandomItems(filtersData.maker_countries.filter(c => c !== 'Unknown'), 5)
      return `Préférez-vous des chocolatiers (fabricants) d'un pays particulier ? ${randomMakers.join(', ')} ?`

    case 'certification':
      const certs = filtersData.certifications.join(', ')
      return `Les certifications sont-elles importantes pour vous ? (${certs})`

    case 'pairing':
      const pairingTypes = ['wine', 'spirits', 'cheese', 'fruits', 'nuts']
      const randomPairing = pairingTypes[Math.floor(Math.random() * pairingTypes.length)]
      let pairings = []

      switch(randomPairing) {
        case 'wine':
          pairings = getRandomItems(filtersData.wine_pairings.filter(w => !w.startsWith(' ')), 4)
          return `Souhaitez-vous accorder votre chocolat avec un vin ? Par exemple : ${pairings.join(', ')} ?`
        case 'spirits':
          pairings = getRandomItems(filtersData.spirit_pairings.filter(s => !s.startsWith(' ')), 4)
          return `Envisagez-vous un accord avec un spiritueux ? ${pairings.join(', ')} ?`
        case 'cheese':
          pairings = filtersData.cheese_pairings
          return `Un accord avec du fromage vous intéresse ? ${pairings.join(', ')} ?`
        case 'fruits':
          pairings = filtersData.fruit_pairings.filter(f => !f.startsWith(' '))
          return `Quel type de fruits aimeriez-vous associer ? ${pairings.join(', ')} ?`
        case 'nuts':
          pairings = filtersData.nut_pairings.filter(n => !n.startsWith(' '))
          return `Préférez-vous des notes de fruits à coque ? ${pairings.join(', ')} ?`
      }
      break

    case 'texture':
      const textures = filtersData.textures_mouthfeel
      return `Quelle texture en bouche préférez-vous ? ${textures.join(', ')} ?`

    case 'bean_variety':
      const varieties = filtersData.bean_varieties
      return `Avez-vous une préférence pour la variété de fève ? ${varieties.join(', ')} ?`

    case 'price_range':
      return "Quel est votre budget ? Économique (<15€), Standard (15-30€), ou Premium (>30€) ?"

    case 'type':
      const types = filtersData.types
      return `Quel type de chocolat préférez-vous ? ${types.join(', ')} ?`

    case 'occasion':
      return "Pour quelle occasion ? Dégustation personnelle, cadeau, partage entre amis ?"

    default:
      return "Avez-vous d'autres préférences particulières ?"
  }
}

const getNextQuestion = getDynamicQuestion

const findRecommendations = (preferences, chocolatesData, filtersData) => {
  console.log('🔍 DEBUGGING RECOMMENDATIONS:')
  console.log('📊 Total chocolates in database:', chocolatesData.length)
  console.log('👤 User preferences:', preferences)

  let filtered = chocolatesData.slice()

  // Filter by type if specified
  if (preferences.type && preferences.type !== 'none') {
    filtered = filtered.filter(c => c.type === preferences.type)
  }

  // Filter by cocoa percentage - NEW CATEGORIES (skip if remove_cocoa is true)
  if (preferences.cocoa_percentage && !preferences.remove_cocoa && preferences.cocoa_percentage !== 'none') {
    const percentage = preferences.cocoa_percentage
    if (percentage === '<40%') {
      filtered = filtered.filter(c => c.cocoa_percentage && c.cocoa_percentage < 40)
    } else if (percentage === '40-50%') {
      filtered = filtered.filter(c => c.cocoa_percentage >= 40 && c.cocoa_percentage <= 50)
    } else if (percentage === '50-70%') {
      filtered = filtered.filter(c => c.cocoa_percentage >= 50 && c.cocoa_percentage <= 70)
    } else if (percentage === '70-85%') {
      filtered = filtered.filter(c => c.cocoa_percentage >= 70 && c.cocoa_percentage <= 85)
    } else if (percentage === '>85%') {
      filtered = filtered.filter(c => c.cocoa_percentage > 85)
    }
  }

  // Filter by continent first (new logic)
  if (preferences.origin_continent && !preferences.remove_origin && preferences.origin_continent !== 'none') {
    const continentCountries = getCountriesByContinent(preferences.origin_continent, filtersData.origin_countries)
    if (continentCountries.length > 0) {
      filtered = filtered.filter(c => continentCountries.includes(c.origin_country))
    }
  }

  // Filter by specific origin country (skip if remove_origin is true)
  if (preferences.origin_country && !preferences.remove_origin && preferences.origin_country !== 'none') {
    filtered = filtered.filter(c => c.origin_country === preferences.origin_country)
  }

  // Filter by maker country (skip if remove_maker is true)
  if (preferences.maker_country && !preferences.remove_maker && preferences.maker_country !== 'none') {
    filtered = filtered.filter(c => c.maker_country === preferences.maker_country)
  }

  // Filter by certification (skip if remove_certification is true)
  if (preferences.certification && !preferences.remove_certification && preferences.certification !== 'none') {
    filtered = filtered.filter(c => {
      const certifications = c.sustainability_certifications || ''
      return certifications.includes(preferences.certification)
    })
  }

  // Filter by pairing preference
  if (preferences.pairing) {
    const { type, value } = preferences.pairing
    if (type === 'wine') {
      filtered = filtered.filter(c => {
        const winePairings = c.pairings_wine || ''
        return winePairings.includes(value)
      })
    } else if (type === 'spirit') {
      filtered = filtered.filter(c => {
        const spiritPairings = c.pairings_spirits || ''
        return spiritPairings.includes(value)
      })
    }
  }

  // Filter by texture (skip if remove_texture is true)
  if (preferences.texture && !preferences.remove_texture && preferences.texture !== 'none') {
    filtered = filtered.filter(c => {
      const texture = c.texture_mouthfeel || ''
      return texture.toLowerCase().includes(preferences.texture.toLowerCase())
    })
  }

  // Filter by bean variety (skip if remove_bean_variety is true)
  if (preferences.bean_variety && !preferences.remove_bean_variety && preferences.bean_variety !== 'none') {
    filtered = filtered.filter(c => {
      const variety = c.bean_variety || ''
      return variety.includes(preferences.bean_variety)
    })
  }

  // Filter by flavor using expanded matching from filters.json (skip if remove_flavor is true)
  if (preferences.flavor_profile && !preferences.remove_flavor && preferences.flavor_profile !== 'none') {
    filtered = filtered.filter(c => {
      const allFlavors = [
        c.flavor_notes_primary,
        c.flavor_notes_secondary,
        c.flavor_notes_tertiary
      ].join(' ').toLowerCase()

      const searchTerm = preferences.flavor_profile.toLowerCase()

      // Direct match
      if (allFlavors.includes(searchTerm)) {
        return true
      }

      // If expand_flavor is true, use broader matching
      if (preferences.expand_flavor) {
        // For cream, expand to dairy-related flavors
        if (searchTerm === 'cream') {
          return allFlavors.includes('milk') || allFlavors.includes('butter') ||
                 allFlavors.includes('vanilla') || allFlavors.includes('caramel') ||
                 allFlavors.includes('honey') || allFlavors.includes('sweet')
        }
        // For other flavors, be more flexible
        return allFlavors.includes(searchTerm.substring(0, 3)) // Match partial
      }

      // Expanded matching for broader flavor families
      if (searchTerm === 'floral') {
        return allFlavors.includes('rose') || allFlavors.includes('violet') ||
               allFlavors.includes('jasmine') || allFlavors.includes('lavender') ||
               allFlavors.includes('orange blossom') || allFlavors.includes('elderflower') ||
               allFlavors.includes('hibiscus')
      }

      if (searchTerm === 'fruité') {
        return allFlavors.includes('cherry') || allFlavors.includes('berry') ||
               allFlavors.includes('citrus') || allFlavors.includes('tropical') ||
               allFlavors.includes('stone fruit') || allFlavors.includes('apple') ||
               allFlavors.includes('pear') || allFlavors.includes('grape')
      }

      if (searchTerm === 'épicé') {
        return allFlavors.includes('cinnamon') || allFlavors.includes('cardamom') ||
               allFlavors.includes('clove') || allFlavors.includes('ginger') ||
               allFlavors.includes('pepper') || allFlavors.includes('chili')
      }

      if (searchTerm === 'noisette') {
        return allFlavors.includes('hazelnut') || allFlavors.includes('almond') ||
               allFlavors.includes('walnut') || allFlavors.includes('pecan') ||
               allFlavors.includes('cashew') || allFlavors.includes('pistachio')
      }

      if (searchTerm === 'caramel') {
        return allFlavors.includes('caramel') || allFlavors.includes('toffee') ||
               allFlavors.includes('butterscotch') || allFlavors.includes('dulce de leche') ||
               allFlavors.includes('honey') || allFlavors.includes('maple')
      }

      return false
    })
  }

  // Filter by price range (NEW LOGIC - was completely missing!)
  if (preferences.price_range && preferences.price_range !== 'none') {
    filtered = filtered.filter(c => {
      const price = parseFloat(c.price_retail) || 0
      if (preferences.price_range === 'economic') {
        return price < 15
      } else if (preferences.price_range === 'standard') {
        return price >= 15 && price <= 30
      } else if (preferences.price_range === 'premium') {
        return price > 30
      }
      return true
    })
  }

  // Sort by rating
  filtered.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0))

  console.log('✅ Filtered results count:', filtered.length)
  console.log('🎯 Final recommendations:', filtered.slice(0, 6).map(c => ({ name: c.name, origin: c.origin_country, cocoa: c.cocoa_percentage })))

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
  const appliedCriteria = []

  // List all applied criteria
  if (preferences.cocoa_percentage && preferences.cocoa_percentage !== 'none') {
    appliedCriteria.push(`pourcentage de cacao (${preferences.cocoa_percentage})`)
  }

  if (preferences.flavor_profile && preferences.flavor_profile !== 'none') {
    appliedCriteria.push(`saveur (${preferences.flavor_profile})`)
  }

  if (preferences.origin_country && preferences.origin_country !== 'none') {
    appliedCriteria.push(`origine (${preferences.origin_country})`)
  }

  if (preferences.maker_country && preferences.maker_country !== 'none') {
    appliedCriteria.push(`chocolatier (${preferences.maker_country})`)
  }

  if (preferences.certification && preferences.certification !== 'none') {
    appliedCriteria.push(`certification (${preferences.certification})`)
  }

  if (preferences.pairing && preferences.pairing !== 'none') {
    if (typeof preferences.pairing === 'object') {
      appliedCriteria.push(`accord ${preferences.pairing.type} (${preferences.pairing.value})`)
    }
  }

  if (preferences.texture && preferences.texture !== 'none') {
    appliedCriteria.push(`texture (${preferences.texture})`)
  }

  if (preferences.bean_variety && preferences.bean_variety !== 'none') {
    appliedCriteria.push(`variété de fève (${preferences.bean_variety})`)
  }

  let message = "Je n'ai trouvé aucun chocolat correspondant exactement à tous vos critères."

  if (appliedCriteria.length > 0) {
    message += `\n\nVos critères actuels :\n• ${appliedCriteria.join('\n• ')}`
    message += "\n\nSouhaiteriez-vous assouplir l'un de ces critères pour que je puisse vous proposer des chocolats exceptionnels ? Par exemple, vous pouvez me dire \"sans le critère origine\" ou \"élargir les saveurs\"."
  }

  return message
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
      content: `Bienvenue chez XOCOA. Je suis votre sommelier personnel du chocolat.

Quel type de chocolat recherchez-vous ?
• Une origine de fabrication spécifique ? (Belgique, France, Suisse...)
• Une origine de fève particulière ? (Madagascar, Ghana, Ecuador...)
• Un type de chocolat ? (tablette, bonbon, truffe...)
• Une concentration en cacao ? (doux, noir, intense...)
• Une saveur particulière ? (fruits, épices, floral...)
• Pour une occasion spéciale ? (dégustation, cadeau...)

Dites-moi ce qui vous intéresse le plus !`,
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
      // Load chocolate data and filters
      const chocolatesResponse = await fetch('/data/chocolates.json')
      const chocolatesData = await chocolatesResponse.json()

      const filtersResponse = await fetch('/data/filters.json')
      const filtersData = await filtersResponse.json()

      // Simple client-side sommelier logic
      const result = await processMessageClientSide({
        message: content,
        currentPreferences: userPreferences,
        conversationHistory: messages,
        chocolatesData,
        filtersData
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