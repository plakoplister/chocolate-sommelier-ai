"""
Agent IA Sommelier du Chocolat - basé sur les données C-SPOT
Un assistant intelligent pour recommander le chocolat parfait
"""

import requests
from bs4 import BeautifulSoup
import json
import re
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum

# Configuration
CSPOT_BASE_URL = "https://www.c-spot.com"

class FlavorProfile(Enum):
    """Profils de saveurs principaux"""
    FRUITY = "fruité"
    NUTTY = "noisetté"
    FLORAL = "floral"
    EARTHY = "terreux"
    SPICY = "épicé"
    SWEET = "doux"
    BITTER = "amer"
    CREAMY = "crémeux"
    WOODY = "boisé"
    CARAMEL = "caramel"

class ChocolateType(Enum):
    """Types de chocolat"""
    DARK = "noir"
    MILK = "lait"
    WHITE = "blanc"
    RUBY = "ruby"
    SINGLE_ORIGIN = "single origin"
    BLEND = "blend"

@dataclass
class Chocolate:
    """Représente un chocolat avec ses caractéristiques"""
    name: str
    brand: str
    origin: Optional[str]
    cocoa_percentage: Optional[int]
    type: ChocolateType
    flavor_notes: List[str]
    rating: Optional[float]
    price_range: Optional[str]
    description: str
    url: Optional[str]

class ChocolateScraper:
    """Scraper pour récupérer les données depuis C-SPOT"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; ChocolateSommelier/1.0)'
        })
    
    def scrape_chocolate_strains(self) -> List[Dict]:
        """Récupère les variétés de chocolat depuis la page strains"""
        try:
            url = f"{CSPOT_BASE_URL}/atlas/chocolate-strains/"
            response = self.session.get(url)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            chocolates = []
            # Adapter selon la structure réelle de la page
            # Ceci est un exemple de structure possible
            
            return chocolates
        except Exception as e:
            print(f"Erreur lors du scraping: {e}")
            return []
    
    def scrape_reviews(self, category: str = "best-rated") -> List[Dict]:
        """Récupère les chocolats depuis les pages de reviews"""
        # À implémenter selon la structure du site
        pass
    
    def search_chocolate(self, query: str) -> List[Dict]:
        """Recherche des chocolats sur le site"""
        # À implémenter avec l'API de recherche du site si disponible
        pass

class ChocolateSommelier:
    """Agent IA Sommelier du Chocolat"""
    
    def __init__(self):
        self.scraper = ChocolateScraper()
        self.user_profile = {}
        self.chocolate_database = []
        
    def initialize_database(self):
        """Charge la base de données des chocolats"""
        print("🍫 Chargement de la base de données des chocolats...")
        # Charger depuis le scraper ou un fichier JSON pré-scrapé
        self.chocolate_database = self.load_chocolate_data()
    
    def load_chocolate_data(self) -> List[Chocolate]:
        """Charge les données des chocolats (depuis fichier ou scraping)"""
        # Pour l'instant, données d'exemple
        return [
            Chocolate(
                name="Piura Select 70%",
                brand="Cacaosuyo",
                origin="Pérou",
                cocoa_percentage=70,
                type=ChocolateType.DARK,
                flavor_notes=["fruité", "floral", "caramel"],
                rating=4.5,
                price_range="€€€",
                description="Un chocolat d'exception du Pérou avec des notes fruitées intenses",
                url=f"{CSPOT_BASE_URL}/chocolate/cacaosuyo-piura-select"
            ),
            Chocolate(
                name="Madagascar 65%",
                brand="Valrhona",
                origin="Madagascar",
                cocoa_percentage=65,
                type=ChocolateType.DARK,
                flavor_notes=["fruité", "acidulé", "fruits rouges"],
                rating=4.3,
                price_range="€€",
                description="Notes de fruits rouges caractéristiques de Madagascar",
                url=None
            ),
            # Ajouter plus de chocolats...
        ]
    
    def ask_preferences(self) -> Dict:
        """Pose des questions pour comprendre les préférences de l'utilisateur"""
        questions = [
            {
                "id": "experience",
                "question": "🍫 Quel est votre niveau d'expérience avec le chocolat fin?",
                "options": ["Débutant", "Amateur", "Connaisseur", "Expert"]
            },
            {
                "id": "type",
                "question": "📊 Quel type de chocolat préférez-vous généralement?",
                "options": ["Noir intense (>70%)", "Noir équilibré (50-70%)", "Lait", "Blanc", "Peu importe"]
            },
            {
                "id": "flavors",
                "question": "🌟 Quelles saveurs recherchez-vous?",
                "options": ["Fruité/Acidulé", "Noisetté/Crémeux", "Floral/Délicat", "Épicé/Complexe", "Classique/Traditionnel"],
                "multiple": True
            },
            {
                "id": "origin",
                "question": "🌍 Avez-vous une préférence d'origine?",
                "options": ["Amérique du Sud", "Afrique", "Asie", "Caraïbes", "Peu importe"]
            },
            {
                "id": "occasion",
                "question": "🎁 Pour quelle occasion?",
                "options": ["Dégustation personnelle", "Cadeau", "Cuisine/Pâtisserie", "Accord mets-chocolat"]
            },
            {
                "id": "budget",
                "question": "💰 Quel est votre budget?",
                "options": ["€ (moins de 5€)", "€€ (5-10€)", "€€€ (10-20€)", "€€€€ (plus de 20€)"]
            },
            {
                "id": "adventure",
                "question": "🚀 Êtes-vous aventureux?",
                "options": ["Je préfère les valeurs sûres", "J'aime découvrir avec modération", "J'adore les découvertes audacieuses"]
            }
        ]
        
        return questions
    
    def calculate_match_score(self, chocolate: Chocolate, preferences: Dict) -> float:
        """Calcule un score de correspondance entre un chocolat et les préférences"""
        score = 0.0
        
        # Logique de scoring basée sur les préférences
        # Type de chocolat
        if preferences.get('type'):
            if ('Noir' in preferences['type'] and chocolate.type == ChocolateType.DARK):
                score += 20
            elif ('Lait' in preferences['type'] and chocolate.type == ChocolateType.MILK):
                score += 20
        
        # Profil de saveurs
        user_flavors = preferences.get('flavors', [])
        for flavor in chocolate.flavor_notes:
            for user_flavor in user_flavors:
                if user_flavor.lower() in flavor.lower():
                    score += 15
        
        # Note/rating
        if chocolate.rating:
            score += chocolate.rating * 5
        
        # Budget
        if preferences.get('budget') and chocolate.price_range:
            if len(preferences['budget']) >= len(chocolate.price_range):
                score += 10
        
        # Niveau d'aventure vs complexité
        if preferences.get('adventure') == "J'adore les découvertes audacieuses":
            if chocolate.type == ChocolateType.SINGLE_ORIGIN:
                score += 15
        
        return min(score, 100)  # Cap à 100
    
    def recommend(self, preferences: Dict, top_n: int = 5) -> List[tuple]:
        """Recommande les meilleurs chocolats basés sur les préférences"""
        recommendations = []
        
        for chocolate in self.chocolate_database:
            score = self.calculate_match_score(chocolate, preferences)
            recommendations.append((chocolate, score))
        
        # Trier par score décroissant
        recommendations.sort(key=lambda x: x[1], reverse=True)
        
        return recommendations[:top_n]
    
    def format_recommendation(self, chocolate: Chocolate, score: float) -> str:
        """Formate une recommandation pour l'affichage"""
        output = f"\n{'='*50}\n"
        output += f"🏆 Score de correspondance: {score:.0f}%\n"
        output += f"📦 {chocolate.name} - {chocolate.brand}\n"
        if chocolate.origin:
            output += f"🌍 Origine: {chocolate.origin}\n"
        if chocolate.cocoa_percentage:
            output += f"🍫 Cacao: {chocolate.cocoa_percentage}%\n"
        output += f"✨ Notes: {', '.join(chocolate.flavor_notes)}\n"
        if chocolate.rating:
            output += f"⭐ Note C-SPOT: {chocolate.rating}/5\n"
        if chocolate.price_range:
            output += f"💶 Prix: {chocolate.price_range}\n"
        output += f"📝 {chocolate.description}\n"
        if chocolate.url:
            output += f"🔗 Plus d'infos: {chocolate.url}\n"
        
        return output
    
    def run_consultation(self):
        """Lance une consultation interactive"""
        print("\n" + "="*60)
        print("🍫 BIENVENUE CHEZ VOTRE SOMMELIER DU CHOCOLAT 🍫")
        print("="*60)
        print("\nJe vais vous poser quelques questions pour trouver")
        print("le chocolat parfait selon vos goûts!\n")
        
        # Initialiser la base de données
        self.initialize_database()
        
        # Poser les questions
        preferences = {}
        questions = self.ask_preferences()
        
        for q in questions:
            print(f"\n{q['question']}")
            for i, option in enumerate(q['options'], 1):
                print(f"  {i}. {option}")
            
            if q.get('multiple'):
                print("(Vous pouvez choisir plusieurs options, séparées par des virgules)")
                choices = input("Votre choix: ").split(',')
                preferences[q['id']] = [q['options'][int(c.strip())-1] for c in choices if c.strip().isdigit()]
            else:
                choice = input("Votre choix (numéro): ")
                if choice.isdigit() and 1 <= int(choice) <= len(q['options']):
                    preferences[q['id']] = q['options'][int(choice)-1]
        
        # Calculer les recommandations
        print("\n🔮 Analyse de vos préférences en cours...")
        recommendations = self.recommend(preferences)
        
        # Afficher les résultats
        print("\n" + "="*60)
        print("🎯 VOS CHOCOLATS RECOMMANDÉS")
        print("="*60)
        
        if recommendations:
            for i, (chocolate, score) in enumerate(recommendations, 1):
                print(f"\n#{i} RECOMMANDATION")
                print(self.format_recommendation(chocolate, score))
        else:
            print("\nDésolé, aucune recommandation trouvée. Essayez d'élargir vos critères.")
        
        print("\n" + "="*60)
        print("Merci d'avoir utilisé le Sommelier du Chocolat!")
        print("Basé sur les données de C-SPOT (c-spot.com)")
        print("="*60)

# Point d'entrée principal
if __name__ == "__main__":
    sommelier = ChocolateSommelier()
    sommelier.run_consultation()