"""
Chocolate Sommelier AI Agent - English Version
An intelligent assistant for perfect chocolate recommendations
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
    """Main flavor profiles"""
    FRUITY = "fruity"
    NUTTY = "nutty"
    FLORAL = "floral"
    EARTHY = "earthy"
    SPICY = "spicy"
    SWEET = "sweet"
    BITTER = "bitter"
    CREAMY = "creamy"
    WOODY = "woody"
    CARAMEL = "caramel"

class ChocolateType(Enum):
    """Chocolate types"""
    DARK = "dark"
    MILK = "milk"
    WHITE = "white"
    RUBY = "ruby"
    SINGLE_ORIGIN = "single origin"
    BLEND = "blend"

@dataclass
class Chocolate:
    """Represents a chocolate with its characteristics"""
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
    """Scraper to retrieve data from C-SPOT"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; ChocolateSommelier/1.0)'
        })
    
    def scrape_chocolate_strains(self) -> List[Dict]:
        """Retrieve chocolate varieties from the strains page"""
        try:
            url = f"{CSPOT_BASE_URL}/atlas/chocolate-strains/"
            response = self.session.get(url)
            soup = BeautifulSoup(response.text, 'html.parser')
            
            chocolates = []
            # Adapt according to actual page structure
            
            return chocolates
        except Exception as e:
            print(f"Error during scraping: {e}")
            return []
    
    def scrape_reviews(self, category: str = "best-rated") -> List[Dict]:
        """Retrieve chocolates from review pages"""
        # To implement based on site structure
        pass
    
    def search_chocolate(self, query: str) -> List[Dict]:
        """Search for chocolates on the site"""
        # To implement with site search API if available
        pass

class ChocolateSommelier:
    """Chocolate Sommelier AI Agent"""
    
    def __init__(self):
        self.scraper = ChocolateScraper()
        self.user_profile = {}
        self.chocolate_database = []
        
    def initialize_database(self):
        """Load the chocolate database"""
        print("🍫 Loading chocolate database...")
        # Load from scraper or pre-scraped JSON file
        self.chocolate_database = self.load_chocolate_data()
    
    def load_chocolate_data(self) -> List[Chocolate]:
        """Load chocolate data (from file or scraping)"""
        # Sample data for now
        return [
            Chocolate(
                name="Piura Select 70%",
                brand="Cacaosuyo",
                origin="Peru",
                cocoa_percentage=70,
                type=ChocolateType.DARK,
                flavor_notes=["fruity", "floral", "caramel"],
                rating=4.5,
                price_range="$$$",
                description="An exceptional chocolate from Peru with intense fruity notes",
                url=f"{CSPOT_BASE_URL}/chocolate/cacaosuyo-piura-select"
            ),
            Chocolate(
                name="Madagascar 65%",
                brand="Valrhona",
                origin="Madagascar",
                cocoa_percentage=65,
                type=ChocolateType.DARK,
                flavor_notes=["fruity", "tangy", "red berries"],
                rating=4.3,
                price_range="$$",
                description="Characteristic red fruit notes from Madagascar",
                url=None
            ),
            Chocolate(
                name="Ecuador 72%",
                brand="Pacari",
                origin="Ecuador",
                cocoa_percentage=72,
                type=ChocolateType.DARK,
                flavor_notes=["floral", "jasmine", "honey"],
                rating=4.6,
                price_range="$$$",
                description="Intense floral profile with jasmine notes",
                url=None
            ),
            Chocolate(
                name="Ghana 68%",
                brand="Divine",
                origin="Ghana",
                cocoa_percentage=68,
                type=ChocolateType.DARK,
                flavor_notes=["classic", "cocoa", "woody"],
                rating=4.0,
                price_range="$",
                description="Classic chocolate profile, pure cocoa notes",
                url=None
            ),
            Chocolate(
                name="Milk Hazelnut 40%",
                brand="Lindt",
                origin="Blend",
                cocoa_percentage=40,
                type=ChocolateType.MILK,
                flavor_notes=["creamy", "nutty", "sweet"],
                rating=4.2,
                price_range="$$",
                description="Smooth milk chocolate with roasted hazelnuts",
                url=None
            ),
        ]
    
    def ask_preferences(self) -> Dict:
        """Ask questions to understand user preferences"""
        questions = [
            {
                "id": "experience",
                "question": "🍫 What's your experience level with fine chocolate?",
                "options": ["Beginner", "Amateur", "Connoisseur", "Expert"]
            },
            {
                "id": "type",
                "question": "📊 What type of chocolate do you generally prefer?",
                "options": ["Dark intense (>70%)", "Dark balanced (50-70%)", "Milk", "White", "No preference"]
            },
            {
                "id": "flavors",
                "question": "🌟 What flavors are you looking for?",
                "options": ["Fruity/Tangy", "Nutty/Creamy", "Floral/Delicate", "Spicy/Complex", "Classic/Traditional"],
                "multiple": True
            },
            {
                "id": "origin",
                "question": "🌍 Do you have an origin preference?",
                "options": ["South America", "Africa", "Asia", "Caribbean", "No preference"]
            },
            {
                "id": "occasion",
                "question": "🎁 What's the occasion?",
                "options": ["Personal tasting", "Gift", "Cooking/Baking", "Food pairing"]
            },
            {
                "id": "budget",
                "question": "💰 What's your budget?",
                "options": ["$ (under $5)", "$$ ($5-10)", "$$$ ($10-20)", "$$$$ (over $20)"]
            },
            {
                "id": "adventure",
                "question": "🚀 How adventurous are you?",
                "options": ["I prefer safe choices", "I like moderate discovery", "I love bold discoveries"]
            }
        ]
        
        return questions
    
    def calculate_match_score(self, chocolate: Chocolate, preferences: Dict) -> float:
        """Calculate a match score between chocolate and preferences"""
        score = 0.0
        
        # Scoring logic based on preferences
        # Chocolate type
        if preferences.get('type'):
            if ('Dark' in preferences['type'] and chocolate.type == ChocolateType.DARK):
                score += 20
            elif ('Milk' in preferences['type'] and chocolate.type == ChocolateType.MILK):
                score += 20
        
        # Flavor profile
        user_flavors = preferences.get('flavors', [])
        for flavor in chocolate.flavor_notes:
            for user_flavor in user_flavors:
                if user_flavor.lower() in flavor.lower():
                    score += 15
        
        # Rating
        if chocolate.rating:
            score += chocolate.rating * 5
        
        # Budget
        if preferences.get('budget') and chocolate.price_range:
            if len(preferences['budget']) >= len(chocolate.price_range):
                score += 10
        
        # Adventure level vs complexity
        if preferences.get('adventure') == "I love bold discoveries":
            if chocolate.type == ChocolateType.SINGLE_ORIGIN:
                score += 15
        
        return min(score, 100)  # Cap at 100
    
    def recommend(self, preferences: Dict, top_n: int = 5) -> List[tuple]:
        """Recommend best chocolates based on preferences"""
        recommendations = []
        
        for chocolate in self.chocolate_database:
            score = self.calculate_match_score(chocolate, preferences)
            recommendations.append((chocolate, score))
        
        # Sort by descending score
        recommendations.sort(key=lambda x: x[1], reverse=True)
        
        return recommendations[:top_n]
    
    def format_recommendation(self, chocolate: Chocolate, score: float) -> str:
        """Format a recommendation for display"""
        output = f"\n{'='*50}\n"
        output += f"🏆 Match Score: {score:.0f}%\n"
        output += f"📦 {chocolate.name} - {chocolate.brand}\n"
        if chocolate.origin:
            output += f"🌍 Origin: {chocolate.origin}\n"
        if chocolate.cocoa_percentage:
            output += f"🍫 Cocoa: {chocolate.cocoa_percentage}%\n"
        output += f"✨ Notes: {', '.join(chocolate.flavor_notes)}\n"
        if chocolate.rating:
            output += f"⭐ C-SPOT Rating: {chocolate.rating}/5\n"
        if chocolate.price_range:
            output += f"💶 Price: {chocolate.price_range}\n"
        output += f"📝 {chocolate.description}\n"
        if chocolate.url:
            output += f"🔗 More info: {chocolate.url}\n"
        
        return output
    
    def run_consultation(self):
        """Launch an interactive consultation"""
        print("\n" + "="*60)
        print("🍫 WELCOME TO YOUR CHOCOLATE SOMMELIER 🍫")
        print("="*60)
        print("\nI'll ask you a few questions to find")
        print("the perfect chocolate for your taste!\n")
        
        # Initialize database
        self.initialize_database()
        
        # Ask questions
        preferences = {}
        questions = self.ask_preferences()
        
        for q in questions:
            print(f"\n{q['question']}")
            for i, option in enumerate(q['options'], 1):
                print(f"  {i}. {option}")
            
            if q.get('multiple'):
                print("(You can choose multiple options, separated by commas)")
                choices = input("Your choice: ").split(',')
                preferences[q['id']] = [q['options'][int(c.strip())-1] for c in choices if c.strip().isdigit()]
            else:
                choice = input("Your choice (number): ")
                if choice.isdigit() and 1 <= int(choice) <= len(q['options']):
                    preferences[q['id']] = q['options'][int(choice)-1]
        
        # Calculate recommendations
        print("\n🔮 Analyzing your preferences...")
        recommendations = self.recommend(preferences)
        
        # Display results
        print("\n" + "="*60)
        print("🎯 YOUR RECOMMENDED CHOCOLATES")
        print("="*60)
        
        if recommendations:
            for i, (chocolate, score) in enumerate(recommendations, 1):
                print(f"\n#{i} RECOMMENDATION")
                print(self.format_recommendation(chocolate, score))
        else:
            print("\nSorry, no recommendations found. Try broadening your criteria.")
        
        print("\n" + "="*60)
        print("Thank you for using the Chocolate Sommelier!")
        print("Based on C-SPOT data (c-spot.com)")
        print("="*60)

# Main entry point
if __name__ == "__main__":
    sommelier = ChocolateSommelier()
    sommelier.run_consultation()