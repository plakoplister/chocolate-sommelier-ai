const { SmartHybridSommelier } = require('../../src/services/smart-hybrid-sommelier.cjs')

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { message, preferences, conversationHistory } = JSON.parse(event.body)

    const sommelier = new SmartHybridSommelier()

    const result = await sommelier.processUserMessage({
      message,
      currentPreferences: preferences || {},
      conversationHistory: conversationHistory || []
    })

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result)
    }
  } catch (error) {
    console.error('Chat function error:', error)

    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: "Je m'excuse, une erreur s'est produite. Pouvez-vous reformuler votre demande ?"
      })
    }
  }
}