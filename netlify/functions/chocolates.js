// Netlify Function - Chocolate Database
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Chocolate database
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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(chocolates)
  };
};