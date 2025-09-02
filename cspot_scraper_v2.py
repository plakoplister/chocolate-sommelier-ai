"""
C-SPOT Scraper V2 - Based on real site structure
Extract chocolate reviews with ratings and comments from c-spot.com
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
from typing import Dict, List, Optional
from urllib.parse import urljoin, urlparse
import logging
from dataclasses import dataclass, asdict

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ChocolateData:
    """Chocolate data from C-SPOT"""
    id: str
    name: str
    maker: str
    origin: Optional[str]
    cocoa_percentage: Optional[int]
    rating: Optional[float]
    review_text: str
    flavor_notes: List[str]
    price: Optional[str]
    type: str
    url: str
    scraped_date: str

class CSpotScraperV2:
    """Updated scraper based on real C-SPOT structure"""
    
    def __init__(self, delay=3):
        self.base_url = "https://www.c-spot.com"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        self.delay = delay
        self.chocolates_data = []
        
    def get_page(self, url: str) -> Optional[BeautifulSoup]:
        """Fetch and parse a page with error handling"""
        try:
            logger.info(f"Fetching: {url}")
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            time.sleep(self.delay)  # Be respectful
            return BeautifulSoup(response.content, 'html.parser')
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            return None
    
    def get_review_sections(self) -> List[str]:
        """Get the main review section URLs"""
        sections = [
            "/chocolate-census/",
            "/chocolate-census/bars/",
            "/chocolate-census/recent-reviews/",
        ]
        return [urljoin(self.base_url, section) for section in sections]
    
    def discover_chocolate_reviews(self) -> List[str]:
        """Find all chocolate review URLs from the census pages"""
        review_urls = set()
        
        # Start with main chocolate census page
        census_url = urljoin(self.base_url, "/chocolate-census/bars/")
        soup = self.get_page(census_url)
        
        if soup:
            # Look for chocolate review links
            # C-SPOT uses pattern /chocolate-census/bars/bar/?pid=XXXX
            links = soup.find_all('a', href=True)
            for link in links:
                href = link['href']
                if 'pid=' in href or '/bar/' in href:
                    full_url = urljoin(self.base_url, href)
                    review_urls.add(full_url)
        
        # Also try to find different categories
        categories = ['best-rated', 'featured', 'recent', 'worst-rated']
        for category in categories:
            category_url = urljoin(self.base_url, f"/chocolate-census/{category}/")
            soup = self.get_page(category_url)
            if soup:
                links = soup.find_all('a', href=True)
                for link in links:
                    href = link['href']
                    if 'pid=' in href or '/bar/' in href:
                        full_url = urljoin(self.base_url, href)
                        review_urls.add(full_url)
        
        # Try pagination - look for numbered pages
        base_census = urljoin(self.base_url, "/chocolate-census/bars/")
        for page_num in range(1, 50):  # Try first 50 pages
            page_url = f"{base_census}page/{page_num}/"
            soup = self.get_page(page_url)
            if soup:
                links = soup.find_all('a', href=True)
                page_has_reviews = False
                for link in links:
                    href = link['href']
                    if 'pid=' in href or '/bar/' in href:
                        full_url = urljoin(self.base_url, href)
                        review_urls.add(full_url)
                        page_has_reviews = True
                
                if not page_has_reviews:
                    logger.info(f"No more reviews found at page {page_num}, stopping pagination")
                    break
            else:
                break
        
        logger.info(f"Discovered {len(review_urls)} chocolate review URLs")
        return list(review_urls)
    
    def extract_chocolate_data(self, url: str) -> Optional[ChocolateData]:
        """Extract chocolate data from a review page"""
        soup = self.get_page(url)
        if not soup:
            return None
        
        try:
            # Extract chocolate name and details
            name = self.extract_chocolate_name(soup)
            maker = self.extract_maker(soup)
            origin = self.extract_origin(soup)
            cocoa_percentage = self.extract_cocoa_percentage(soup)
            rating = self.extract_rating(soup)
            review_text = self.extract_review_text(soup)
            flavor_notes = self.extract_flavor_notes(soup)
            price = self.extract_price(soup)
            chocolate_type = self.extract_type(soup)
            
            if not name and not maker:
                logger.warning(f"No name or maker found for {url}")
                return None
            
            chocolate_data = ChocolateData(
                id=self.generate_id(name or "unknown", maker or "unknown"),
                name=name or "Unknown Chocolate",
                maker=maker or "Unknown Maker",
                origin=origin,
                cocoa_percentage=cocoa_percentage,
                rating=rating,
                review_text=review_text or "",
                flavor_notes=flavor_notes,
                price=price,
                type=chocolate_type or "dark",
                url=url,
                scraped_date=time.strftime("%Y-%m-%d")
            )
            
            return chocolate_data
            
        except Exception as e:
            logger.error(f"Error extracting data from {url}: {e}")
            return None
    
    def extract_chocolate_name(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract chocolate name from page"""
        # Try different selectors for chocolate name
        selectors = [
            'h1',
            '.chocolate-name',
            '.product-title',
            'title'
        ]
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                text = element.get_text().strip()
                # Clean up common patterns
                text = re.sub(r'C-spot.*review', '', text, flags=re.IGNORECASE)
                text = re.sub(r'chocolate review', '', text, flags=re.IGNORECASE)
                if text and len(text) > 3:
                    return text
        
        return None
    
    def extract_maker(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract chocolate maker/brand"""
        # Look for maker in various places
        text = soup.get_text()
        
        # Common maker patterns
        maker_patterns = [
            r'Maker:\s*([^\n\r]+)',
            r'Brand:\s*([^\n\r]+)',
            r'by\s+([A-Z][a-zA-Z\s]+)',
        ]
        
        for pattern in maker_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                maker = match.group(1).strip()
                if len(maker) > 1:
                    return maker
        
        # Look in page structure
        maker_selectors = [
            '.maker',
            '.brand',
            '.chocolate-maker'
        ]
        
        for selector in maker_selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text().strip()
        
        return None
    
    def extract_origin(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract chocolate origin"""
        text = soup.get_text()
        
        # Look for origin patterns
        origin_patterns = [
            r'Origin:\s*([^\n\r]+)',
            r'Country:\s*([^\n\r]+)',
            r'from\s+([A-Z][a-zA-Z\s]+)',
        ]
        
        for pattern in origin_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                origin = match.group(1).strip()
                if len(origin) > 1:
                    return origin
        
        # Known chocolate origins
        origins = [
            'Madagascar', 'Peru', 'Ecuador', 'Venezuela', 'Ghana', 'Tanzania',
            'Brazil', 'Colombia', 'Bolivia', 'Mexico', 'Java', 'India',
            'Dominican Republic', 'Costa Rica', 'Panama', 'Nicaragua',
            'Trinidad', 'Grenada', 'Belize'
        ]
        
        for origin in origins:
            if origin in text:
                return origin
        
        return None
    
    def extract_cocoa_percentage(self, soup: BeautifulSoup) -> Optional[int]:
        """Extract cocoa percentage"""
        text = soup.get_text()
        
        # Look for percentage patterns
        percentage_patterns = [
            r'(\d{2,3})%',
            r'(\d{2,3})\s*percent',
            r'cocoa:\s*(\d{2,3})'
        ]
        
        for pattern in percentage_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                pct = int(match)
                if 20 <= pct <= 100:  # Reasonable range
                    return pct
        
        return None
    
    def extract_rating(self, soup: BeautifulSoup) -> Optional[float]:
        """Extract C-SPOT rating"""
        text = soup.get_text()
        
        # Look for rating patterns (C-SPOT uses various rating systems)
        rating_patterns = [
            r'Rating:\s*(\d+\.?\d*)',
            r'Score:\s*(\d+\.?\d*)', 
            r'(\d+\.?\d*)\s*/\s*5',
            r'(\d+\.?\d*)\s*/\s*10',
            r'★+\s*(\d+\.?\d*)',
        ]
        
        for pattern in rating_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                rating = float(match.group(1))
                # Normalize to 5-point scale
                if rating <= 5:
                    return rating
                elif rating <= 10:
                    return rating / 2  # Convert 10-point to 5-point
                elif rating <= 100:
                    return rating / 20  # Convert 100-point to 5-point
        
        return None
    
    def extract_review_text(self, soup: BeautifulSoup) -> str:
        """Extract the review/tasting notes text"""
        # Look for review content
        review_selectors = [
            '.review-content',
            '.tasting-notes', 
            '.description',
            'p'
        ]
        
        review_texts = []
        for selector in review_selectors:
            elements = soup.select(selector)
            for element in elements:
                text = element.get_text().strip()
                if len(text) > 50 and 'chocolate' in text.lower():
                    review_texts.append(text)
        
        # Return the longest meaningful text
        if review_texts:
            return max(review_texts, key=len)[:1000]  # Limit length
        
        return ""
    
    def extract_flavor_notes(self, soup: BeautifulSoup) -> List[str]:
        """Extract flavor notes from text"""
        text = soup.get_text().lower()
        notes = []
        
        # Comprehensive flavor vocabulary
        flavor_terms = {
            'fruity': ['fruity', 'fruit', 'berry', 'citrus', 'orange', 'lemon', 'cherry', 'raspberry'],
            'nutty': ['nutty', 'nut', 'almond', 'hazelnut', 'walnut', 'pecan'],
            'floral': ['floral', 'flower', 'jasmine', 'rose', 'lavender', 'violet'],
            'spicy': ['spicy', 'spice', 'cinnamon', 'pepper', 'cardamom', 'ginger'],
            'earthy': ['earthy', 'earth', 'soil', 'mushroom', 'woody', 'forest'],
            'sweet': ['sweet', 'honey', 'vanilla', 'caramel', 'toffee'],
            'bitter': ['bitter', 'astringent', 'tannic'],
            'creamy': ['creamy', 'smooth', 'buttery', 'rich'],
            'tropical': ['tropical', 'coconut', 'mango', 'pineapple', 'banana'],
            'wine': ['wine-like', 'fermented', 'alcoholic', 'grape']
        }
        
        for category, terms in flavor_terms.items():
            for term in terms:
                if term in text:
                    notes.append(category)
                    break  # Don't duplicate categories
        
        # Also look for specific flavor mentions
        specific_flavors = ['tobacco', 'leather', 'coffee', 'tea', 'mint', 'licorice']
        for flavor in specific_flavors:
            if flavor in text:
                notes.append(flavor)
        
        return list(set(notes))  # Remove duplicates
    
    def extract_price(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract price information"""
        text = soup.get_text()
        
        # Look for price patterns
        price_patterns = [
            r'Price:\s*([^\n\r]+)',
            r'Cost:\s*([^\n\r]+)',
            r'\$\d+\.?\d*',
            r'€\d+\.?\d*'
        ]
        
        for pattern in price_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0).strip()
        
        return None
    
    def extract_type(self, soup: BeautifulSoup) -> str:
        """Extract chocolate type"""
        text = soup.get_text().lower()
        
        if 'milk' in text:
            return 'milk'
        elif 'white' in text:
            return 'white'
        elif 'ruby' in text:
            return 'ruby'
        else:
            return 'dark'
    
    def generate_id(self, name: str, maker: str) -> str:
        """Generate unique ID"""
        clean_name = re.sub(r'[^a-zA-Z0-9]', '', name.lower())
        clean_maker = re.sub(r'[^a-zA-Z0-9]', '', maker.lower())
        return f"{clean_maker}_{clean_name}"[:50]
    
    def scrape_chocolates(self, limit: Optional[int] = None) -> List[ChocolateData]:
        """Main scraping method"""
        logger.info("🍫 Starting C-SPOT chocolate database extraction...")
        
        # Discover review URLs
        review_urls = self.discover_chocolate_reviews()
        
        if not review_urls:
            logger.warning("No review URLs found!")
            return []
        
        if limit:
            review_urls = review_urls[:limit]
            logger.info(f"Limited to first {limit} chocolates")
        
        logger.info(f"Processing {len(review_urls)} chocolate reviews...")
        
        # Extract data from each review
        for i, url in enumerate(review_urls, 1):
            chocolate_data = self.extract_chocolate_data(url)
            
            if chocolate_data:
                self.chocolates_data.append(chocolate_data)
                logger.info(f"✅ {i}/{len(review_urls)}: {chocolate_data.name} by {chocolate_data.maker} (Rating: {chocolate_data.rating})")
            else:
                logger.warning(f"❌ {i}/{len(review_urls)}: Failed to extract data")
            
            # Progress update
            if i % 25 == 0:
                logger.info(f"📊 Progress: {i}/{len(review_urls)} completed")
        
        logger.info(f"🎉 Extraction complete! Found {len(self.chocolates_data)} chocolates")
        return self.chocolates_data
    
    def save_to_json(self, filename: str = "cspot_chocolates_full.json") -> str:
        """Save data to JSON"""
        data = {
            'metadata': {
                'source': 'c-spot.com',
                'scraped_date': time.strftime("%Y-%m-%d %H:%M:%S"),
                'total_chocolates': len(self.chocolates_data),
                'average_rating': sum(c.rating for c in self.chocolates_data if c.rating) / len([c for c in self.chocolates_data if c.rating]) if self.chocolates_data else 0
            },
            'chocolates': [asdict(chocolate) for chocolate in self.chocolates_data]
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"💾 Data saved to {filename}")
        return filename

def main():
    """Run the scraper"""
    scraper = CSpotScraperV2(delay=3)
    
    try:
        # Start with a smaller batch for testing
        chocolates = scraper.scrape_chocolates(limit=50)
        
        if chocolates:
            filename = scraper.save_to_json()
            
            # Show statistics
            rated_chocolates = [c for c in chocolates if c.rating]
            avg_rating = sum(c.rating for c in rated_chocolates) / len(rated_chocolates) if rated_chocolates else 0
            
            print(f"\n🍫 SCRAPING RESULTS:")
            print(f"📊 Total chocolates: {len(chocolates)}")
            print(f"⭐ With ratings: {len(rated_chocolates)}")
            print(f"📈 Average rating: {avg_rating:.1f}")
            print(f"💾 Saved to: {filename}")
            
            # Show top rated
            if rated_chocolates:
                top_5 = sorted(rated_chocolates, key=lambda x: x.rating, reverse=True)[:5]
                print(f"\n🏆 TOP 5 RATED:")
                for i, choc in enumerate(top_5, 1):
                    print(f"{i}. {choc.name} ({choc.maker}) - ⭐ {choc.rating}")
            
        else:
            print("❌ No chocolates extracted")
            
    except KeyboardInterrupt:
        print("\n⏹️  Interrupted by user")
        if scraper.chocolates_data:
            scraper.save_to_json("partial_cspot_data.json")

if __name__ == "__main__":
    main()