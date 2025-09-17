import { OpenAISommelier } from '../../services/openai-sommelier'

const sommelier = new OpenAISommelier()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { message, preferences = {}, conversationHistory = [] } = req.body

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Message is required' })
    }

    // Process the user's message through the sommelier
    const response = await sommelier.processUserMessage({
      message: message.trim(),
      currentPreferences: preferences,
      conversationHistory
    })

    res.status(200).json(response)

  } catch (error) {
    console.error('Error in chat API:', error)
    res.status(500).json({
      message: "Je m'excuse, une erreur s'est produite. Pouvez-vous reformuler votre demande ?",
      preferences: {},
      recommendations: []
    })
  }
}