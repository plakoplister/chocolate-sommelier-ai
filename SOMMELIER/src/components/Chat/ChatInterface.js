import { useState, useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'
import FixedChatInput from './FixedChatInput'
import ChocolateRecommendations from '../Recommendations/ChocolateRecommendations'
import { useTranslation } from '../../hooks/useTranslation'
import { useLanguage } from '../../contexts/LanguageContext'

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

// Detect search type from initial response (multilingual)
const detectSearchType = (message) => {
  const lowerMessage = message.toLowerCase()

  // Maker focused (FR/EN)
  if (lowerMessage.includes('fabrication') || lowerMessage.includes('belgique') ||
      lowerMessage.includes('france') || lowerMessage.includes('suisse') ||
      lowerMessage.includes('chocolatier') || lowerMessage.includes('manufacturing') ||
      lowerMessage.includes('belgium') || lowerMessage.includes('switzerland') ||
      lowerMessage.includes('manufacturer')) {
    return 'maker_focused'
  }

  // Origin focused (FR/EN)
  if (lowerMessage.includes('fève') || lowerMessage.includes('madagascar') ||
      lowerMessage.includes('ghana') || lowerMessage.includes('ecuador') ||
      lowerMessage.includes('origine') || lowerMessage.includes('bean') ||
      lowerMessage.includes('origin')) {
    return 'origin_focused'
  }

  // Type focused (FR/EN)
  if (lowerMessage.includes('tablette') || lowerMessage.includes('bonbon') ||
      lowerMessage.includes('truffe') || lowerMessage.includes('type') ||
      lowerMessage.includes('bar') || lowerMessage.includes('truffle')) {
    return 'type_focused'
  }

  // Cocoa focused (FR/EN)
  if (lowerMessage.includes('doux') || lowerMessage.includes('noir') ||
      lowerMessage.includes('intense') || lowerMessage.includes('cacao') ||
      lowerMessage.includes('concentration') || lowerMessage.includes('%') ||
      lowerMessage.includes('milk') || lowerMessage.includes('dark') ||
      lowerMessage.includes('cocoa')) {
    return 'cocoa_focused'
  }

  // Flavor focused (FR/EN)
  if (lowerMessage.includes('fruit') || lowerMessage.includes('épice') ||
      lowerMessage.includes('floral') || lowerMessage.includes('saveur') ||
      lowerMessage.includes('flavor') || lowerMessage.includes('spice') ||
      lowerMessage.includes('taste')) {
    return 'flavor_focused'
  }

  // Occasion focused (FR/EN)
  if (lowerMessage.includes('dégustation') || lowerMessage.includes('cadeau') ||
      lowerMessage.includes('occasion') || lowerMessage.includes('tasting') ||
      lowerMessage.includes('gift')) {
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
const processMessageClientSide = async ({ message, currentPreferences, conversationHistory, chocolatesData, filtersData, t }) => {
  // Determine what category we're currently asking about
  let currentCategory = null
  if (currentPreferences.conversationCategories) {
    const missingCategories = currentPreferences.conversationCategories.filter(req =>
      !currentPreferences[req] || currentPreferences[req] === ''
    )
    currentCategory = missingCategories[0] || null
  }

  // Extract preferences from message
  console.log('🔄 Current preferences before extraction:', currentPreferences)
  const extractedPreferences = extractPreferencesFromMessage(message, filtersData, currentCategory)
  console.log('🔄 Extracted preferences from this message:', extractedPreferences)
  const updatedPreferences = { ...currentPreferences, ...extractedPreferences }
  console.log('🔄 Updated preferences after merge:', updatedPreferences)

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
    responseMessage = `${t('welcome.greeting')} ${getDynamicQuestion(firstCategory, filtersData, updatedPreferences, t)}`
  } else if (previouslyHadRecommendations && hasAllPreferences) {
    // Continue conversation after recommendations
    responseMessage = handleFollowUpMessage(message, updatedPreferences, t)
    if (!isRequestingNewSearch(message)) {
      recommendations = findRecommendations(updatedPreferences, chocolatesData, filtersData)
    }
  } else if (missingInfo.length > 0) {
    responseMessage = getDynamicQuestion(missingInfo[0], filtersData, updatedPreferences, t)
  } else if (actualPreferences >= 2) {
    // We have enough actual preferences, make recommendations
    console.log('📌 MAKING RECOMMENDATIONS with preferences:', updatedPreferences)
    recommendations = findRecommendations(updatedPreferences, chocolatesData, filtersData)
    console.log('📌 Found recommendations:', recommendations.length)
    responseMessage = generateRecommendationMessage(recommendations, updatedPreferences, t)
  } else {
    // Not enough preferences, ask one more question
    const unansweredCategories = updatedPreferences.conversationCategories.filter(req =>
      !updatedPreferences[req] || updatedPreferences[req] === ''
    )
    if (unansweredCategories.length > 0) {
      responseMessage = getDynamicQuestion(unansweredCategories[0], filtersData, updatedPreferences, t)
    } else {
      // Fallback to recommendations even with few preferences
      console.log('📌 FALLBACK RECOMMENDATIONS with preferences:', updatedPreferences)
      recommendations = findRecommendations(updatedPreferences, chocolatesData, filtersData)
      console.log('📌 Found recommendations:', recommendations.length)
      responseMessage = generateRecommendationMessage(recommendations, updatedPreferences, t)
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

  // Check for "skip" responses (multilingual)
  const skipResponses = [
    // French
    'aucun', 'aucune', 'non', 'pas de préférence', 'peu importe', 'indifférent',
    'je ne sais pas', 'pas d\'avis', 'n\'importe', 'passer', 'suivant',
    // English
    'none', 'any', 'no preference', 'doesn\'t matter', 'don\'t care', 'indifferent',
    'don\'t know', 'no opinion', 'whatever', 'skip', 'pass', 'next'
  ]

  const isSkipResponse = skipResponses.some(skip => lowerMessage.includes(skip))

  // If it's a skip response, only set the current category to 'none'
  if (isSkipResponse && currentCategory) {
    preferences[currentCategory] = 'none'
    console.log(`⏭️ Skipping current category: ${currentCategory}`)
    return preferences
  }

  // Cocoa percentage - NEW CATEGORIES (only when asking about cocoa percentage) - MULTILINGUAL
  if (currentCategory === 'cocoa_percentage') {
    if (lowerMessage.includes('très doux') || lowerMessage.includes('very mild') ||
        lowerMessage.includes('<40') || lowerMessage.includes('< 40')) {
      preferences.cocoa_percentage = '<40%'
    } else if ((lowerMessage.includes('doux') && !lowerMessage.includes('très')) ||
               lowerMessage.includes('milk') || lowerMessage.includes('40-50')) {
      preferences.cocoa_percentage = '40-50%'
    } else if (lowerMessage.includes('noir léger') || lowerMessage.includes('dark light') ||
               lowerMessage.includes('50-70') || lowerMessage.includes('50%')) {
      preferences.cocoa_percentage = '50-70%'
    } else if ((lowerMessage.includes('noir') && !lowerMessage.includes('léger')) ||
               (lowerMessage.includes('dark') && !lowerMessage.includes('light')) ||
               lowerMessage.includes('70-85') || lowerMessage.includes('70%') ||
               lowerMessage.includes('75%') || lowerMessage.includes('80%')) {
      preferences.cocoa_percentage = '70-85%'
    } else if (lowerMessage.includes('intense') || lowerMessage.includes('>85') ||
               lowerMessage.includes('> 85') || lowerMessage.includes('85%') ||
               lowerMessage.includes('90%') || lowerMessage.includes('95%')) {
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

  // Detect requests to relax criteria (ALWAYS CHECK, regardless of current category) - MULTILINGUAL
  // This should work even after recommendations are made
  if (lowerMessage.includes('sans') || lowerMessage.includes('enlever') || lowerMessage.includes('retirer') ||
      lowerMessage.includes('without') || lowerMessage.includes('remove') || lowerMessage.includes('drop')) {
    console.log('🔓 DETECTED: Request to remove criteria')
    if (lowerMessage.includes('origine') || lowerMessage.includes('pays') ||
        lowerMessage.includes('origin') || lowerMessage.includes('country')) {
      preferences.remove_origin = true
      console.log('   → Removing origin criteria')
    }
    if (lowerMessage.includes('saveur') || lowerMessage.includes('goût') ||
        lowerMessage.includes('flavor') || lowerMessage.includes('taste')) {
      preferences.remove_flavor = true
      console.log('   → Removing flavor criteria')
    }
    if (lowerMessage.includes('cacao') || lowerMessage.includes('pourcentage') ||
        lowerMessage.includes('cocoa') || lowerMessage.includes('percentage')) {
      preferences.remove_cocoa = true
      console.log('   → Removing cocoa criteria')
    }
    if (lowerMessage.includes('chocolatier') || lowerMessage.includes('fabricant') ||
        lowerMessage.includes('manufacturer') || lowerMessage.includes('maker')) {
      preferences.remove_maker = true
      console.log('   → Removing maker criteria')
    }
    if (lowerMessage.includes('certification') ||
        lowerMessage.includes('fair trade') || lowerMessage.includes('organic') ||
        lowerMessage.includes('b-corp') || lowerMessage.includes('demeter') ||
        lowerMessage.includes('direct trade') || lowerMessage.includes('rainforest') ||
        lowerMessage.includes('utz')) {
      preferences.remove_certification = true
      console.log('   → Removing certification criteria')
    }
  }

  if (lowerMessage.includes('élargir') || lowerMessage.includes('assouplir') ||
      lowerMessage.includes('broaden') || lowerMessage.includes('expand') || lowerMessage.includes('relax')) {
    console.log('🔓 DETECTED: Request to expand criteria')
    if (lowerMessage.includes('saveur') || lowerMessage.includes('goût') ||
        lowerMessage.includes('flavor') || lowerMessage.includes('taste')) {
      preferences.expand_flavor = true
      console.log('   → Expanding flavor criteria')
    }
    if (lowerMessage.includes('origine') || lowerMessage.includes('pays') ||
        lowerMessage.includes('origin') || lowerMessage.includes('country')) {
      preferences.expand_origin = true
      console.log('   → Expanding origin criteria')
    }
  }

  // Keep occasion for backward compatibility (multilingual)
  if (lowerMessage.includes('cadeau') || lowerMessage.includes('offrir') ||
      lowerMessage.includes('gift') || lowerMessage.includes('present')) {
    preferences.occasion = 'cadeau'
  } else if (lowerMessage.includes('dégustation') || lowerMessage.includes('personnel') ||
             lowerMessage.includes('tasting') || lowerMessage.includes('personal') ||
             lowerMessage.includes('myself')) {
    preferences.occasion = 'dégustation'
  }

  console.log('✅ Extracted preferences:', preferences)

  return preferences
}

// Generate dynamic questions based on category and available data
const getDynamicQuestion = (category, filtersData, userPreferences = {}, t) => {
  switch (category) {
    case 'cocoa_percentage':
      return t('questions.cocoaPercentage')

    case 'flavor_profile':
      // Pick 10 random flavors from the list
      const randomFlavors = getRandomItems(filtersData.flavors.filter(f => !f.startsWith(' ')), 10)
      const flavorGroups = randomFlavors.slice(0, 6).join(', ')
      return t('questions.flavor', { flavors: flavorGroups })

    case 'origin_continent':
      return t('questions.originContinent')

    case 'origin_country':
      // Filter countries based on selected continent
      if (userPreferences.origin_continent && userPreferences.origin_continent !== 'none') {
        const continentCountries = getCountriesByContinent(userPreferences.origin_continent, filtersData.origin_countries)
        if (continentCountries.length > 0) {
          const randomCountries = getRandomItems(continentCountries, Math.min(6, continentCountries.length))
          return t('questions.originCountry', {
            continent: userPreferences.origin_continent.toLowerCase(),
            countries: randomCountries.join(', ')
          })
        }
      }
      // Fallback if no continent selected or no countries found
      const randomCountries = getRandomItems(filtersData.origin_countries, 6)
      return t('questions.originCountryGeneral', { countries: randomCountries.join(', ') })

    case 'maker_country':
      // Pick 5 random maker countries
      const randomMakers = getRandomItems(filtersData.maker_countries.filter(c => c !== 'Unknown'), 5)
      return t('questions.makerCountry', { countries: randomMakers.join(', ') })

    case 'certification':
      const certs = filtersData.certifications.join(', ')
      return t('questions.certification', { certifications: certs })

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
      return t('questions.beanVariety', { varieties: varieties.join(', ') })

    case 'price_range':
      return t('questions.price')

    case 'type':
      const types = filtersData.types
      return t('questions.type', { types: types.join(', ') })

    case 'occasion':
      return t('questions.occasion')

    default:
      return t('questions.other')
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

const generateRecommendationMessage = (recommendations, preferences, t) => {
  if (recommendations.length === 0) {
    return generateNoResultsMessage(preferences, t)
  }

  let message = `${t('recommendations.perfect')}`
  if (preferences.cocoa_percentage) {
    message += ` (${preferences.cocoa_percentage})`
  }
  if (preferences.flavor_profile) {
    message += `, ${preferences.flavor_profile}`
  }
  message += `, ${t('recommendations.found', { count: recommendations.length })}\n\n${t('recommendations.askMore')}`
  return message
}

const generateNoResultsMessage = (preferences, t) => {
  const appliedCriteria = []

  // List all applied criteria
  if (preferences.cocoa_percentage && preferences.cocoa_percentage !== 'none') {
    appliedCriteria.push(`${t('recommendations.criteriaLabels.cocoa_percentage')} (${preferences.cocoa_percentage})`)
  }

  if (preferences.flavor_profile && preferences.flavor_profile !== 'none') {
    appliedCriteria.push(`${t('recommendations.criteriaLabels.flavor_profile')} (${preferences.flavor_profile})`)
  }

  if (preferences.origin_country && preferences.origin_country !== 'none') {
    appliedCriteria.push(`${t('recommendations.criteriaLabels.origin_country')} (${preferences.origin_country})`)
  }

  if (preferences.maker_country && preferences.maker_country !== 'none') {
    appliedCriteria.push(`${t('recommendations.criteriaLabels.maker_country')} (${preferences.maker_country})`)
  }

  if (preferences.certification && preferences.certification !== 'none') {
    appliedCriteria.push(`${t('recommendations.criteriaLabels.certification')} (${preferences.certification})`)
  }

  if (preferences.pairing && preferences.pairing !== 'none') {
    if (typeof preferences.pairing === 'object') {
      appliedCriteria.push(`${t('recommendations.criteriaLabels.pairing')} ${preferences.pairing.type} (${preferences.pairing.value})`)
    }
  }

  if (preferences.texture && preferences.texture !== 'none') {
    appliedCriteria.push(`${t('recommendations.criteriaLabels.texture')} (${preferences.texture})`)
  }

  if (preferences.bean_variety && preferences.bean_variety !== 'none') {
    appliedCriteria.push(`${t('recommendations.criteriaLabels.bean_variety')} (${preferences.bean_variety})`)
  }

  let message = t('recommendations.noResults')

  if (appliedCriteria.length > 0) {
    message += `\n\n${t('recommendations.currentCriteria')} :\n• ${appliedCriteria.join('\n• ')}`
    message += `\n\n${t('recommendations.relaxCriteria')}`
  }

  return message
}

const handleFollowUpMessage = (message, preferences, t) => {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('merci') || lowerMessage.includes('thank')) {
    return t('followUp.thanks')
  }

  if (lowerMessage.includes('détail') || lowerMessage.includes('plus d\'info') ||
      lowerMessage.includes('detail') || lowerMessage.includes('more info')) {
    return t('followUp.moreDetails')
  }

  return t('followUp.default')
}

const isRequestingNewSearch = (message) => {
  const lowerMessage = message.toLowerCase()
  return lowerMessage.includes('nouvelle recherche') ||
         lowerMessage.includes('recommencer') ||
         lowerMessage.includes('autres chocolats')
}

export default function ChatInterface() {
  const { t, lang } = useTranslation()
  const { language } = useLanguage()

  // Build initial welcome message from translations
  const getWelcomeMessage = () => {
    const w = lang.welcome
    return `${w.greeting}

${w.question}
• ${w.options.maker}
• ${w.options.origin}
• ${w.options.type}
• ${w.options.cocoa}
• ${w.options.flavor}
• ${w.options.occasion}

${w.prompt}`
  }

  const [messages, setMessages] = useState([])

  // Reset messages when language changes
  useEffect(() => {
    setMessages([
      {
        id: 1,
        type: 'assistant',
        content: getWelcomeMessage(),
        timestamp: new Date()
      }
    ])
  }, [language]) // eslint-disable-line react-hooks/exhaustive-deps
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
      // Use hybrid API instead of client-side logic
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          preferences: userPreferences,
          conversationHistory: messages.map(msg => ({
            type: msg.type,
            content: msg.content
          }))
        })
      })

      const result = await response.json()

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