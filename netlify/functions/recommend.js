// Netlify Function - Chocolate Recommendations Engine
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const preferences = JSON.parse(event.body);
    
    // Chocolate database (same as chocolates.js)
    const chocolates = [
      {
        id: 1,
        name: "Piura Select 70%",
        brand: "Cacaosuyo",
        origin: "Peru",
        cocoa_percentage: 70,
        type: "dark",
        flavor_notes: ["fruity", "floral", "caramel"],
        rating: 4.5,
        price_range: "$$$",
        description: "An exceptional chocolate from Peru with intense fruity notes",
        url: "https://www.c-spot.com/chocolate/cacaosuyo-piura-select"
      },
      {
        id: 2,
        name: "Madagascar 65%",
        brand: "Valrhona",
        origin: "Madagascar",
        cocoa_percentage: 65,
        type: "dark",
        flavor_notes: ["fruity", "tangy", "red berries"],
        rating: 4.3,
        price_range: "$$",
        description: "Characteristic red fruit notes from Madagascar",
        url: null
      },
      {
        id: 3,
        name: "Ecuador 72%",
        brand: "Pacari",
        origin: "Ecuador",
        cocoa_percentage: 72,
        type: "dark",
        flavor_notes: ["floral", "jasmine", "honey"],
        rating: 4.6,
        price_range: "$$$",
        description: "Intense floral profile with jasmine notes",
        url: null
      },
      {
        id: 4,
        name: "Ghana 68%",
        brand: "Divine",
        origin: "Ghana",
        cocoa_percentage: 68,
        type: "dark",
        flavor_notes: ["classic", "cocoa", "woody"],
        rating: 4.0,
        price_range: "$",
        description: "Classic chocolate profile, pure cocoa notes",
        url: null
      },
      {
        id: 5,
        name: "Venezuela 75%",
        brand: "Amedei",
        origin: "Venezuela",
        cocoa_percentage: 75,
        type: "dark",
        flavor_notes: ["nutty", "tobacco", "leather"],
        rating: 4.7,
        price_range: "$$$$",
        description: "Complex and sophisticated with earthy undertones",
        url: null
      },
      {
        id: 6,
        name: "Milk Hazelnut 40%",
        brand: "Lindt",
        origin: "Blend",
        cocoa_percentage: 40,
        type: "milk",
        flavor_notes: ["creamy", "nutty", "sweet"],
        rating: 4.2,
        price_range: "$$",
        description: "Smooth milk chocolate with roasted hazelnuts",
        url: null
      },
      {
        id: 7,
        name: "Tanzania 70%",
        brand: "Original Beans",
        origin: "Tanzania",
        cocoa_percentage: 70,
        type: "dark",
        flavor_notes: ["citrus", "tropical fruit", "bright"],
        rating: 4.4,
        price_range: "$$$",
        description: "Bright and lively with citrus notes",
        url: null
      },
      {
        id: 8,
        name: "Ruby Cacao 47%",
        brand: "Callebaut",
        origin: "Brazil",
        cocoa_percentage: 47,
        type: "ruby",
        flavor_notes: ["berry", "tart", "fruity"],
        rating: 4.1,
        price_range: "$$$",
        description: "Natural pink chocolate with berry notes",
        url: null
      }
    ];

    // Calculate match scores
    const recommendations = chocolates.map(chocolate => {
      let score = 0;
      
      // Type preference
      if (preferences.type) {
        if (preferences.type.includes('Dark') && chocolate.type === 'dark') {
          score += 20;
        } else if (preferences.type.includes('Milk') && chocolate.type === 'milk') {
          score += 20;
        } else if (preferences.type.includes('No preference')) {
          score += 10;
        }
      }
      
      // Flavor matching
      if (preferences.flavors && Array.isArray(preferences.flavors)) {
        preferences.flavors.forEach(userFlavor => {
          chocolate.flavor_notes.forEach(chocoFlavor => {
            if (userFlavor.toLowerCase().includes('fruity') && chocoFlavor.includes('fruit')) {
              score += 15;
            }
            if (userFlavor.toLowerCase().includes('nutty') && chocoFlavor.includes('nut')) {
              score += 15;
            }
            if (userFlavor.toLowerCase().includes('floral') && chocoFlavor.includes('floral')) {
              score += 15;
            }
            if (userFlavor.toLowerCase().includes('classic') && chocoFlavor.includes('classic')) {
              score += 15;
            }
          });
        });
      }
      
      // Origin preference
      if (preferences.origin && chocolate.origin) {
        if (preferences.origin === 'South America' && 
            ['Peru', 'Ecuador', 'Venezuela', 'Brazil'].includes(chocolate.origin)) {
          score += 15;
        }
        if (preferences.origin === 'Africa' && 
            ['Madagascar', 'Ghana', 'Tanzania'].includes(chocolate.origin)) {
          score += 15;
        }
      }
      
      // Budget matching
      if (preferences.budget && chocolate.price_range) {
        const budgetLevel = preferences.budget.split('(')[0].trim().length;
        const priceLevel = chocolate.price_range.length;
        if (budgetLevel >= priceLevel) {
          score += 10;
        }
      }
      
      // Experience level
      if (preferences.experience === 'Beginner' && chocolate.cocoa_percentage < 70) {
        score += 10;
      } else if (preferences.experience === 'Expert' && chocolate.cocoa_percentage >= 70) {
        score += 10;
      }
      
      // Adventure level
      if (preferences.adventure === 'I love bold discoveries') {
        if (chocolate.type === 'ruby' || chocolate.cocoa_percentage >= 75) {
          score += 15;
        }
      }
      
      // Add rating bonus
      score += chocolate.rating * 5;
      
      return {
        ...chocolate,
        score: Math.min(Math.round(score), 100)
      };
    });
    
    // Sort by score and return top 3
    recommendations.sort((a, b) => b.score - a.score);
    const topRecommendations = recommendations.slice(0, 3);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'success',
        recommendations: topRecommendations
      })
    };
    
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ 
        error: 'Invalid request',
        message: error.message 
      })
    };
  }
};