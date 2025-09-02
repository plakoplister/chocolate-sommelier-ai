"""
Chatbot IA Sommelier du Chocolat - Version conversationnelle
Interface plus naturelle avec l'IA pour recommandations personnalisées
"""

import openai
import json
from typing import Dict, List, Optional
import re

class ChocolateAIChatbot:
    """Chatbot IA utilisant GPT pour des recommandations de chocolat naturelles"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.conversation_history = []
        self.user_preferences = {}
        
        # Prompt système pour l'IA
        self.system_prompt = """
        Tu es un sommelier expert du chocolat, passionné et chaleureux. Tu as une connaissance 
        approfondie des chocolats fins du monde entier, basée sur la base de données C-SPOT.
        
        Ton rôle est de:
        1. Poser des questions pertinentes et engageantes pour comprendre les goûts de l'utilisateur
        2. Éduquer subtilement sur le chocolat sans être condescendant
        3. Faire des recommandations personnalisées et précises
        4. Créer une expérience de découverte agréable et mémorable
        
        Style de conversation:
        - Chaleureux et accessible, mais professionnel
        - Utilise des métaphores sensorielles
        - Pose des questions ouvertes pour engager
        - Adapte ton niveau de détail selon l'expertise de l'utilisateur
        
        Base de données disponible:
        - Chocolats de C-SPOT avec notes de dégustation
        - Origines: Pérou, Madagascar, Équateur, Venezuela, etc.
        - Marques: Cacaosuyo, Valrhona, Bonnat, Amedei, etc.
        - Profils: fruité, floral, noisetté, épicé, boisé, etc.
        """
        
        # Base de connaissances chocolat (à enrichir avec les vraies données C-SPOT)
        self.chocolate_knowledge = {
            "origins": {
                "Madagascar": "Notes de fruits rouges, acidité vive, finale longue",
                "Pérou": "Profil fruité et floral, notes de miel",
                "Équateur": "Floral intense, notes de jasmin",
                "Venezuela": "Noisette, caramel, très équilibré",
                "Ghana": "Chocolat classique, notes de cacao pur",
                "Tanzanie": "Fruité tropical, notes d'agrumes"
            },
            "brands": {
                "Cacaosuyo": "Artisan péruvien, single origin d'exception",
                "Valrhona": "Référence française, grands crus",
                "Bonnat": "Tradition française, torréfaction maîtrisée",
                "Amedei": "Excellence italienne, texture soyeuse",
                "Original Beans": "Durable, préservation de variétés rares"
            },
            "flavor_wheels": {
                "fruité": ["fruits rouges", "agrumes", "fruits tropicaux", "fruits secs"],
                "floral": ["jasmin", "rose", "violette", "fleur d'oranger"],
                "épicé": ["cannelle", "poivre", "cardamome", "gingembre"],
                "noisetté": ["amande", "noisette", "noix", "praliné"],
                "terreux": ["champignon", "sous-bois", "tabac", "cuir"]
            }
        }
    
    def start_conversation(self):
        """Démarre une nouvelle conversation"""
        self.conversation_history = []
        self.user_preferences = {}
        
        welcome_message = """
        🍫 Bonjour et bienvenue ! Je suis votre sommelier personnel du chocolat.
        
        Comme un œnologue guide à travers les vins, je vais vous accompagner 
        dans l'univers fascinant du chocolat fin. 
        
        Dites-moi, qu'est-ce qui vous amène aujourd'hui ? 
        Cherchez-vous une expérience particulière, avez-vous envie de découvrir 
        de nouveaux horizons chocolatés, ou souhaitez-vous simplement trouver 
        le chocolat parfait pour un moment spécial ?
        """
        
        return welcome_message
    
    def analyze_user_input(self, user_input: str) -> Dict:
        """Analyse l'input utilisateur pour extraire les préférences"""
        preferences = {}
        
        # Détection du niveau d'expertise
        if any(word in user_input.lower() for word in ["débutant", "nouveau", "première fois", "découvrir"]):
            preferences["expertise"] = "beginner"
        elif any(word in user_input.lower() for word in ["expert", "connaisseur", "collection", "single origin"]):
            preferences["expertise"] = "expert"
        
        # Détection des préférences de goût
        if any(word in user_input.lower() for word in ["fruité", "acidulé", "vif", "frais"]):
            preferences["flavor_profile"] = "fruity"
        elif any(word in user_input.lower() for word in ["doux", "crémeux", "lait", "caramel"]):
            preferences["flavor_profile"] = "sweet"
        elif any(word in user_input.lower() for word in ["intense", "amer", "puissant", "corsé"]):
            preferences["flavor_profile"] = "intense"
        
        # Détection de l'occasion
        if any(word in user_input.lower() for word in ["cadeau", "offrir", "anniversaire"]):
            preferences["occasion"] = "gift"
        elif any(word in user_input.lower() for word in ["cuisine", "pâtisserie", "recette"]):
            preferences["occasion"] = "cooking"
        
        return preferences
    
    def generate_questions(self, context: Dict) -> str:
        """Génère des questions contextuelles basées sur la conversation"""
        if not context.get("expertise"):
            return """
            Pour mieux vous guider, j'aimerais en savoir un peu plus sur votre 
            relation avec le chocolat. Êtes-vous plutôt amateur de chocolat noir 
            intense ou préférez-vous la douceur du chocolat au lait ? 
            
            Et dites-moi, y a-t-il des saveurs particulières qui vous font vibrer ?
            """
        
        if not context.get("flavor_profile"):
            return """
            Fascinant ! Maintenant, parlons saveurs. Imaginez-vous plutôt :
            - 🍓 Des notes fruitées et acidulées, comme une balade dans un verger ?
            - 🌰 Des arômes de noisettes grillées et de caramel ?
            - 🌺 Des touches florales délicates et élégantes ?
            - 🌶️ Des épices exotiques qui racontent des voyages lointains ?
            
            Qu'est-ce qui fait danser vos papilles ?
            """
        
        if not context.get("budget"):
            return """
            Une dernière chose : le chocolat fin est un art, et comme tout art, 
            il existe à différents niveaux de prix. Avez-vous un budget en tête, 
            ou êtes-vous ouvert à explorer différentes gammes pour cette expérience ?
            """
        
        return None
    
    def make_recommendations(self, preferences: Dict) -> List[Dict]:
        """Génère des recommandations basées sur les préférences"""
        recommendations = []
        
        # Logique de recommandation basée sur les préférences
        if preferences.get("flavor_profile") == "fruity":
            recommendations.append({
                "name": "Madagascar 65% - Valrhona",
                "description": "Un voyage sensoriel aux notes de fruits rouges éclatantes",
                "why": "Parfait pour votre goût des saveurs fruitées et vives",
                "tasting_notes": "Framboise, groseille, finale acidulée élégante",
                "pairing": "Sublime avec un thé Earl Grey ou des fruits rouges frais"
            })
            recommendations.append({
                "name": "Piura 70% - Cacaosuyo",
                "description": "Le trésor fruité du Pérou",
                "why": "Un équilibre parfait entre fruité et floral",
                "tasting_notes": "Fruits tropicaux, miel d'acacia, jasmin",
                "pairing": "Merveilleux avec un café éthiopien ou un vin blanc aromatique"
            })
        
        elif preferences.get("flavor_profile") == "sweet":
            recommendations.append({
                "name": "Jivara 40% - Valrhona",
                "description": "La douceur lactée sublimée",
                "why": "Crémeux et gourmand sans être trop sucré",
                "tasting_notes": "Caramel, vanille, noisette grillée",
                "pairing": "Parfait avec un cappuccino ou des fruits secs"
            })
        
        elif preferences.get("flavor_profile") == "intense":
            recommendations.append({
                "name": "Chuao 75% - Amedei",
                "description": "L'intensité maîtrisée du Venezuela",
                "why": "Puissant mais équilibré, pour les amateurs éclairés",
                "tasting_notes": "Tabac, cuir, fruits secs, finale persistante",
                "pairing": "Sublime avec un whisky tourbé ou un expresso corsé"
            })
        
        return recommendations
    
    def format_recommendation_message(self, recommendations: List[Dict]) -> str:
        """Formate les recommandations en message engageant"""
        message = """
        🎯 Voici mes recommandations personnalisées pour vous :
        
        """
        
        for i, rec in enumerate(recommendations, 1):
            message += f"""
        {i}. 🏆 {rec['name']}
        {rec['description']}
        
        ✨ Pourquoi ce choix : {rec['why']}
        👅 Notes de dégustation : {rec['tasting_notes']}
        🍷 Accord parfait : {rec['pairing']}
        
        """
        
        message += """
        💡 Conseil de dégustation : Laissez le chocolat fondre lentement sur 
        votre langue. Respirez doucement par le nez pour libérer tous les arômes. 
        C'est un voyage sensoriel, prenez votre temps !
        
        Souhaitez-vous plus de détails sur l'un de ces chocolats, ou 
        aimeriez-vous explorer d'autres options ?
        """
        
        return message
    
    def process_message(self, user_input: str) -> str:
        """Traite un message utilisateur et génère une réponse"""
        # Ajouter à l'historique
        self.conversation_history.append({"role": "user", "content": user_input})
        
        # Analyser l'input
        new_preferences = self.analyze_user_input(user_input)
        self.user_preferences.update(new_preferences)
        
        # Déterminer la réponse appropriée
        if len(self.conversation_history) == 1:
            # Première interaction
            response = self.generate_questions(self.user_preferences)
        elif len(self.user_preferences) < 3:
            # Continuer à poser des questions
            response = self.generate_questions(self.user_preferences)
        else:
            # Faire des recommandations
            recommendations = self.make_recommendations(self.user_preferences)
            response = self.format_recommendation_message(recommendations)
        
        # Si pas de question générée, faire des recommandations
        if response is None:
            recommendations = self.make_recommendations(self.user_preferences)
            response = self.format_recommendation_message(recommendations)
        
        self.conversation_history.append({"role": "assistant", "content": response})
        
        return response
    
    def export_conversation(self) -> Dict:
        """Exporte la conversation et les préférences"""
        return {
            "conversation": self.conversation_history,
            "preferences": self.user_preferences,
            "timestamp": str(datetime.now())
        }

# Interface en ligne de commande
def run_cli_interface():
    """Lance l'interface CLI du chatbot"""
    chatbot = ChocolateAIChatbot()
    
    print("\n" + "="*60)
    print("🍫 SOMMELIER IA DU CHOCOLAT - MODE CONVERSATIONNEL 🍫")
    print("="*60)
    print(chatbot.start_conversation())
    print("\n(Tapez 'quit' pour terminer, 'reset' pour recommencer)")
    print("-"*60)
    
    while True:
        user_input = input("\n👤 Vous: ").strip()
        
        if user_input.lower() == 'quit':
            print("\n🍫 Merci pour cette dégustation virtuelle ! À bientôt !")
            break
        elif user_input.lower() == 'reset':
            print("\n" + "="*60)
            print("🔄 Nouvelle conversation")
            print("="*60)
            print(chatbot.start_conversation())
            continue
        
        response = chatbot.process_message(user_input)
        print(f"\n🤖 Sommelier: {response}")

if __name__ == "__main__":
    from datetime import datetime
    run_cli_interface()