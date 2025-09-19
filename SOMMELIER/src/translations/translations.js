export const translations = {
  en: {
    // Welcome message
    welcome: {
      greeting: "Welcome to XOCOA. I'm your personal chocolate sommelier.",
      question: "What type of chocolate are you looking for?",
      options: {
        maker: "A specific manufacturing origin? (Belgium, France, Switzerland...)",
        origin: "A particular bean origin? (Madagascar, Ghana, Ecuador...)",
        type: "A chocolate type? (bar, bonbon, truffle...)",
        cocoa: "A cocoa concentration? (milk, dark, intense...)",
        flavor: "A particular flavor? (fruits, spices, floral...)",
        occasion: "For a special occasion? (tasting, gift...)"
      },
      prompt: "Tell me what interests you most!"
    },

    // Questions
    questions: {
      cocoaPercentage: "What cocoa percentage do you prefer? Very mild (<40%), milk (40-50%), dark light (50-70%), dark (70-85%), or intense (>85%)?",
      originContinent: "Which cocoa origin region interests you? Africa, Asia, or South America?",
      originCountry: "Which cocoa origin country from {continent} interests you? {countries}?",
      originCountryGeneral: "Which specific cocoa origin country? {countries}?",
      makerCountry: "Do you prefer chocolatiers (manufacturers) from a particular country? {countries}?",
      type: "What type of chocolate do you prefer? {types}?",
      flavor: "Which flavors appeal to you most? For example: {flavors}?",
      certification: "Are certifications important to you? ({certifications})",
      price: "What's your budget? Economic (<€15), Standard (€15-30), or Premium (>€30)?",
      occasion: "For what occasion? Personal tasting, gift, sharing with friends?",
      beanVariety: "Do you have a preference for bean variety? {varieties}?",
      other: "Do you have any other specific preferences?"
    },

    // Recommendations
    recommendations: {
      perfect: "Perfect! Based on your preferences",
      found: "here are my {count} personalized recommendations.",
      askMore: "Feel free to ask me for more information about any of them!",
      noResults: "I couldn't find any chocolate matching all your criteria exactly.",
      currentCriteria: "Your current criteria:",
      relaxCriteria: "Would you like to relax one of these criteria so I can suggest exceptional chocolates? For example, you can tell me 'without the origin criteria' or 'broaden the flavors'.",
      criteriaLabels: {
        cocoa_percentage: "cocoa percentage",
        flavor_profile: "flavor",
        origin_country: "origin",
        maker_country: "chocolatier",
        certification: "certification",
        pairing: "pairing",
        texture: "texture",
        bean_variety: "bean variety",
        type: "type"
      }
    },

    // Follow-up messages
    followUp: {
      thanks: "You're welcome! It's a pleasure to help you discover wonderful chocolates. Do you have any other questions?",
      moreDetails: "I'd be happy to give you more details! Which chocolate interests you particularly?",
      default: "How can I help you further? Would you like to explore other options or do you have questions about these recommendations?"
    },

    // Skip responses to detect
    skipResponses: ["none", "any", "no preference", "doesn't matter", "indifferent", "don't know", "no opinion", "whatever", "skip", "pass", "next"],

    // Relax criteria keywords
    relaxKeywords: {
      remove: ["without", "remove", "drop"],
      expand: ["broaden", "expand", "relax"],
      origin: ["origin", "country"],
      flavor: ["flavor", "taste"],
      cocoa: ["cocoa", "percentage"],
      maker: ["chocolatier", "manufacturer"],
      certification: ["certification"]
    }
  },

  fr: {
    // Message d'accueil
    welcome: {
      greeting: "Bienvenue chez XOCOA. Je suis votre sommelier personnel du chocolat.",
      question: "Quel type de chocolat recherchez-vous ?",
      options: {
        maker: "Une origine de fabrication spécifique ? (Belgique, France, Suisse...)",
        origin: "Une origine de fève particulière ? (Madagascar, Ghana, Ecuador...)",
        type: "Un type de chocolat ? (tablette, bonbon, truffe...)",
        cocoa: "Une concentration en cacao ? (doux, noir, intense...)",
        flavor: "Une saveur particulière ? (fruits, épices, floral...)",
        occasion: "Pour une occasion spéciale ? (dégustation, cadeau...)"
      },
      prompt: "Dites-moi ce qui vous intéresse le plus !"
    },

    // Questions
    questions: {
      cocoaPercentage: "Quel pourcentage de cacao préférez-vous ? Très doux (<40%), doux (40-50%), noir léger (50-70%), noir (70-85%), ou intense (>85%) ?",
      originContinent: "Quelle région d'origine du cacao vous intéresse ? Afrique, Asie, ou Amérique du Sud ?",
      originCountry: "Quel pays d'origine du cacao de {continent} vous intéresse ? {countries} ?",
      originCountryGeneral: "Dans quel pays d'origine du cacao spécifiquement ? {countries} ?",
      makerCountry: "Préférez-vous des chocolatiers (fabricants) d'un pays particulier ? {countries} ?",
      type: "Quel type de chocolat préférez-vous ? {types} ?",
      flavor: "Quelles saveurs vous attirent le plus ? Par exemple : {flavors} ?",
      certification: "Les certifications sont-elles importantes pour vous ? ({certifications})",
      price: "Quel est votre budget ? Économique (<15€), Standard (15-30€), ou Premium (>30€) ?",
      occasion: "Pour quelle occasion ? Dégustation personnelle, cadeau, partage entre amis ?",
      beanVariety: "Avez-vous une préférence pour la variété de fève ? {varieties} ?",
      other: "Avez-vous d'autres préférences particulières ?"
    },

    // Recommandations
    recommendations: {
      perfect: "Parfait ! Basé sur vos préférences",
      found: "voici mes {count} recommandations personnalisées.",
      askMore: "N'hésitez pas à me dire si vous souhaitez plus d'informations sur l'un d'eux !",
      noResults: "Je n'ai trouvé aucun chocolat correspondant exactement à tous vos critères.",
      currentCriteria: "Vos critères actuels :",
      relaxCriteria: "Souhaiteriez-vous assouplir l'un de ces critères pour que je puisse vous proposer des chocolats exceptionnels ? Par exemple, vous pouvez me dire \"sans le critère origine\" ou \"élargir les saveurs\".",
      criteriaLabels: {
        cocoa_percentage: "pourcentage de cacao",
        flavor_profile: "saveur",
        origin_country: "origine",
        maker_country: "chocolatier",
        certification: "certification",
        pairing: "accord",
        texture: "texture",
        bean_variety: "variété de fève",
        type: "type"
      }
    },

    // Messages de suivi
    followUp: {
      thanks: "Je vous en prie ! C'est un plaisir de vous aider à découvrir de merveilleux chocolats. Avez-vous d'autres questions ?",
      moreDetails: "Je serais ravi de vous donner plus de détails ! Quel chocolat vous intéresse particulièrement ?",
      default: "Comment puis-je vous aider davantage ? Souhaitez-vous explorer d'autres options ou avez-vous des questions sur ces recommandations ?"
    },

    // Réponses de skip à détecter
    skipResponses: ["aucun", "aucune", "non", "pas de préférence", "peu importe", "indifférent", "je ne sais pas", "pas d'avis", "n'importe", "skip", "passer", "suivant"],

    // Mots-clés pour relaxer les critères
    relaxKeywords: {
      remove: ["sans le", "enlever", "retirer"],
      expand: ["élargir", "assouplir"],
      origin: ["origine", "pays"],
      flavor: ["saveur", "goût"],
      cocoa: ["cacao", "pourcentage"],
      maker: ["chocolatier", "fabricant"],
      certification: ["certification"]
    }
  }
}

// Helper function to get translated text
export const getTranslation = (lang, path) => {
  const keys = path.split('.')
  let result = translations[lang] || translations.en

  for (const key of keys) {
    result = result[key]
    if (!result) return path // Return path if translation not found
  }

  return result
}