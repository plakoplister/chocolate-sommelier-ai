"""
C-SPOT Complete Scraper - Extract ALL chocolates with ratings and reviews
Comprehensive data extraction for chocolate sommelier AI
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
class ChocolateReview:
    """Individual review/rating for a chocolate"""
    reviewer: str
    rating: float
    comment: str
    date: Optional[str] = None
    helpful_count: Optional[int] = None

@dataclass
class ChocolateData:
    """Complete chocolate data structure"""
    id: str
    name: str
    brand: str
    origin: Optional[str]
    cocoa_percentage: Optional[int]
    type: str
    price: Optional[str]
    description: str
    flavor_notes: List[str]
    average_rating: Optional[float]
    total_reviews: int
    reviews: List[ChocolateReview]
    url: str
    image_url: Optional[str]
    awards: List[str]
    availability: Optional[str]
    scraped_date: str

class CSpotScraper:
    """Advanced C-SPOT scraper for complete chocolate database"""
    
    def __init__(self, delay=2):
        self.base_url = "https://www.c-spot.com"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
        self.delay = delay  # Respectful scraping delay
        self.chocolates_data = []
        
    def get_page(self, url: str) -> Optional[BeautifulSoup]:
        """Fetch and parse a page with error handling"""
        try:
            logger.info(f"Fetching: {url}")
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            time.sleep(self.delay)  # Be respectful to the server
            return BeautifulSoup(response.content, 'html.parser')
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            return None
    
    def discover_chocolate_pages(self) -> List[str]:
        """Discover all chocolate pages from various sections"""
        chocolate_urls = set()
        
        # Pages to explore for chocolate links
        discovery_pages = [
            "/reviews/latest/",
            "/reviews/best-rated/", 
            "/reviews/featured/",
            "/reviews/worst-rated/",
            "/atlas/chocolate-strains/",
            "/search/?type=chocolate",
        ]
        
        for page_path in discovery_pages:
            url = urljoin(self.base_url, page_path)
            soup = self.get_page(url)
            if soup:
                # Find all chocolate-related links
                links = soup.find_all('a', href=True)
                for link in links:
                    href = link['href']
                    if self.is_chocolate_page(href):
                        full_url = urljoin(self.base_url, href)
                        chocolate_urls.add(full_url)
        
        # Also try to find pagination and get more pages
        for page_num in range(1, 20):  # Get first 20 pages
            for section in ['latest', 'best-rated', 'featured']:
                paginated_url = f"{self.base_url}/reviews/{section}/page/{page_num}/"
                soup = self.get_page(paginated_url)
                if soup:
                    links = soup.find_all('a', href=True)
                    for link in links:
                        href = link['href']
                        if self.is_chocolate_page(href):
                            full_url = urljoin(self.base_url, href)
                            chocolate_urls.add(full_url)
        
        logger.info(f"Discovered {len(chocolate_urls)} unique chocolate pages")
        return list(chocolate_urls)
    
    def is_chocolate_page(self, url: str) -> bool:
        """Determine if URL is a chocolate page"""
        # Common patterns for chocolate pages on C-SPOT
        chocolate_patterns = [
            r'/chocolate/',
            r'/review/',
            r'/brands/.*chocolate',
            r'/origin/.*chocolate',
        ]
        
        for pattern in chocolate_patterns:
            if re.search(pattern, url, re.IGNORECASE):
                return True
        return False
    
    def extract_chocolate_data(self, url: str) -> Optional[ChocolateData]:
        """Extract comprehensive chocolate data from a page"""
        soup = self.get_page(url)
        if not soup:
            return None
            
        try:
            # Extract basic info
            name = self.extract_name(soup)
            brand = self.extract_brand(soup) 
            origin = self.extract_origin(soup)
            cocoa_percentage = self.extract_cocoa_percentage(soup)
            chocolate_type = self.extract_type(soup)
            price = self.extract_price(soup)
            description = self.extract_description(soup)
            flavor_notes = self.extract_flavor_notes(soup)
            image_url = self.extract_image(soup)
            awards = self.extract_awards(soup)
            availability = self.extract_availability(soup)
            
            # Extract ratings and reviews
            average_rating, total_reviews, reviews = self.extract_reviews(soup, url)
            
            chocolate_data = ChocolateData(
                id=self.generate_id(name, brand),
                name=name or "Unknown",
                brand=brand or "Unknown",
                origin=origin,
                cocoa_percentage=cocoa_percentage,
                type=chocolate_type or "dark",
                price=price,
                description=description or "",
                flavor_notes=flavor_notes,
                average_rating=average_rating,
                total_reviews=total_reviews,
                reviews=reviews,
                url=url,
                image_url=image_url,
                awards=awards,
                availability=availability,
                scraped_date=time.strftime("%Y-%m-%d")
            )
            
            return chocolate_data
            
        except Exception as e:
            logger.error(f"Error extracting data from {url}: {e}")
            return None
    
    def extract_name(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract chocolate name"""
        selectors = [
            'h1.chocolate-name',
            'h1.product-title', 
            'h1.entry-title',
            '.chocolate-title',
            'h1'
        ]
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text().strip()
        return None
    
    def extract_brand(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract brand name"""
        selectors = [
            '.chocolate-brand',
            '.brand-name',
            '.manufacturer',
            '.maker'
        ]
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text().strip()
        
        # Try to extract from title or breadcrumbs
        title = soup.find('title')
        if title:
            title_text = title.get_text()
            # Look for "Brand - Chocolate" pattern
            if ' - ' in title_text:
                return title_text.split(' - ')[0].strip()
        
        return None
    
    def extract_origin(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract chocolate origin/country"""
        selectors = [
            '.origin',
            '.country',
            '.region',
            '.chocolate-origin'
        ]
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text().strip()
        
        # Look for origin in text content
        text = soup.get_text()
        origins = ['Madagascar', 'Peru', 'Ecuador', 'Venezuela', 'Ghana', 'Tanzania', 
                  'Brazil', 'Colombia', 'Bolivia', 'Mexico', 'Java', 'India']
        for origin in origins:
            if origin in text:
                return origin
        
        return None
    
    def extract_cocoa_percentage(self, soup: BeautifulSoup) -> Optional[int]:
        """Extract cocoa percentage"""
        # Look for percentage in various places
        text = soup.get_text()
        percentage_match = re.search(r'(\d{2,3})%', text)
        if percentage_match:
            pct = int(percentage_match.group(1))
            if 20 <= pct <= 100:  # Reasonable range
                return pct
        return None
    
    def extract_type(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract chocolate type (dark, milk, white, etc.)"""
        text = soup.get_text().lower()
        if 'milk' in text:
            return 'milk'
        elif 'white' in text:
            return 'white'
        elif 'ruby' in text:
            return 'ruby'
        else:
            return 'dark'
    
    def extract_price(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract price information"""
        selectors = [
            '.price',
            '.cost', 
            '.chocolate-price'
        ]
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text().strip()
        return None
    
    def extract_description(self, soup: BeautifulSoup) -> str:
        """Extract chocolate description"""
        selectors = [
            '.chocolate-description',
            '.product-description',
            '.entry-content p:first-child',
            '.description'
        ]
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text().strip()
        
        # Fallback to meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc:
            return meta_desc.get('content', '')
        
        return ""
    
    def extract_flavor_notes(self, soup: BeautifulSoup) -> List[str]:
        """Extract flavor notes/tasting notes"""
        notes = []
        
        # Look for flavor note elements
        selectors = [
            '.flavor-notes li',
            '.tasting-notes li',
            '.notes li',
            '.flavors span'
        ]
        
        for selector in selectors:
            elements = soup.select(selector)
            for element in elements:
                note = element.get_text().strip()
                if note and note not in notes:
                    notes.append(note)
        
        # Extract from text using keywords
        text = soup.get_text().lower()
        flavor_keywords = [
            'fruity', 'nutty', 'floral', 'earthy', 'spicy', 'sweet', 
            'bitter', 'creamy', 'woody', 'caramel', 'vanilla',
            'citrus', 'berry', 'tropical', 'honey', 'tobacco',
            'leather', 'jasmine', 'rose'
        ]
        
        for keyword in flavor_keywords:
            if keyword in text and keyword not in notes:
                notes.append(keyword)
        
        return notes[:10]  # Limit to top 10
    
    def extract_image(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract chocolate image URL"""
        selectors = [
            'img.chocolate-image',
            '.product-image img',
            '.chocolate-photo img',
            'img[alt*="chocolate"]'
        ]
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element and element.get('src'):
                return urljoin(self.base_url, element['src'])
        return None
    
    def extract_awards(self, soup: BeautifulSoup) -> List[str]:
        """Extract awards/medals"""
        awards = []
        selectors = [
            '.awards li',
            '.medals li', 
            '.accolades li'
        ]
        
        for selector in selectors:
            elements = soup.select(selector)
            for element in elements:
                award = element.get_text().strip()
                if award:
                    awards.append(award)
        
        return awards
    
    def extract_availability(self, soup: BeautifulSoup) -> Optional[str]:
        """Extract availability status"""
        selectors = [
            '.availability',
            '.stock-status',
            '.in-stock'
        ]
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                return element.get_text().strip()
        return None
    
    def extract_reviews(self, soup: BeautifulSoup, url: str) -> tuple:
        """Extract ratings and detailed reviews"""
        reviews = []
        total_reviews = 0
        average_rating = None
        
        # Extract overall rating
        rating_selectors = [
            '.average-rating',
            '.overall-rating', 
            '.rating-value',
            '.stars-rating'
        ]
        
        for selector in rating_selectors:
            element = soup.select_one(selector)
            if element:
                rating_text = element.get_text()
                rating_match = re.search(r'(\d+\.?\d*)', rating_text)
                if rating_match:
                    average_rating = float(rating_match.group(1))
                    break
        
        # Extract individual reviews
        review_selectors = [
            '.review',
            '.comment',
            '.user-review',
            '.customer-review'
        ]
        
        for selector in review_selectors:
            review_elements = soup.select(selector)
            for review_elem in review_elements:
                review = self.extract_single_review(review_elem)
                if review:
                    reviews.append(review)
        
        # Get total review count
        count_selectors = [
            '.review-count',
            '.total-reviews',
            '.reviews-total'
        ]
        
        for selector in count_selectors:
            element = soup.select_one(selector)
            if element:
                count_text = element.get_text()
                count_match = re.search(r'(\d+)', count_text)
                if count_match:
                    total_reviews = int(count_match.group(1))
                    break
        
        if not total_reviews:
            total_reviews = len(reviews)
        
        return average_rating, total_reviews, reviews
    
    def extract_single_review(self, review_elem) -> Optional[ChocolateReview]:
        """Extract data from a single review element"""
        try:
            # Extract reviewer name
            reviewer_elem = review_elem.select_one('.reviewer, .author, .user-name')
            reviewer = reviewer_elem.get_text().strip() if reviewer_elem else "Anonymous"
            
            # Extract rating
            rating_elem = review_elem.select_one('.rating, .stars, .score')
            rating = None
            if rating_elem:
                rating_text = rating_elem.get_text()
                rating_match = re.search(r'(\d+\.?\d*)', rating_text)
                if rating_match:
                    rating = float(rating_match.group(1))
            
            # Extract comment
            comment_elem = review_elem.select_one('.comment-text, .review-text, .content')
            comment = comment_elem.get_text().strip() if comment_elem else ""
            
            # Extract date
            date_elem = review_elem.select_one('.date, .review-date, .posted-date')
            date = date_elem.get_text().strip() if date_elem else None
            
            if rating is not None or comment:
                return ChocolateReview(
                    reviewer=reviewer,
                    rating=rating or 0.0,
                    comment=comment,
                    date=date
                )
        except Exception as e:
            logger.error(f"Error extracting review: {e}")
        
        return None
    
    def generate_id(self, name: str, brand: str) -> str:
        """Generate unique ID for chocolate"""
        clean_name = re.sub(r'[^a-zA-Z0-9]', '', (name or "")).lower()
        clean_brand = re.sub(r'[^a-zA-Z0-9]', '', (brand or "")).lower()
        return f"{clean_brand}_{clean_name}"[:50]
    
    def scrape_all_chocolates(self) -> List[ChocolateData]:
        """Main method to scrape all chocolates"""
        logger.info("Starting comprehensive C-SPOT scraping...")
        
        # Discover all chocolate pages
        chocolate_urls = self.discover_chocolate_pages()
        
        if not chocolate_urls:
            logger.warning("No chocolate pages found!")
            return []
        
        logger.info(f"Found {len(chocolate_urls)} chocolate pages to scrape")
        
        # Extract data from each page
        for i, url in enumerate(chocolate_urls, 1):
            logger.info(f"Processing {i}/{len(chocolate_urls)}: {url}")
            
            chocolate_data = self.extract_chocolate_data(url)
            if chocolate_data:
                self.chocolates_data.append(chocolate_data)
                logger.info(f"✅ Extracted: {chocolate_data.name} by {chocolate_data.brand}")
            else:
                logger.warning(f"❌ Failed to extract data from {url}")
            
            # Progress update every 10 chocolates
            if i % 10 == 0:
                logger.info(f"Progress: {i}/{len(chocolate_urls)} pages processed")
        
        logger.info(f"Scraping complete! Extracted {len(self.chocolates_data)} chocolates")
        return self.chocolates_data
    
    def save_to_json(self, filename: str = "cspot_chocolates_database.json"):
        """Save scraped data to JSON file"""
        data = {
            'metadata': {
                'source': 'c-spot.com',
                'scraped_date': time.strftime("%Y-%m-%d %H:%M:%S"),
                'total_chocolates': len(self.chocolates_data),
                'scraper_version': '1.0'
            },
            'chocolates': [asdict(chocolate) for chocolate in self.chocolates_data]
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Data saved to {filename}")
        return filename

def main():
    """Main scraping function"""
    scraper = CSpotScraper(delay=2)  # 2 second delay between requests
    
    try:
        # Scrape all chocolates
        chocolates = scraper.scrape_all_chocolates()
        
        if chocolates:
            # Save to JSON
            filename = scraper.save_to_json()
            
            # Print summary
            print(f"\n🍫 SCRAPING COMPLETE! 🍫")
            print(f"📊 Total chocolates extracted: {len(chocolates)}")
            print(f"💾 Data saved to: {filename}")
            print(f"⭐ Reviews collected: {sum(len(c.reviews) for c in chocolates)}")
            
            # Show top 5 chocolates by rating
            rated_chocolates = [c for c in chocolates if c.average_rating]
            if rated_chocolates:
                top_chocolates = sorted(rated_chocolates, 
                                      key=lambda x: x.average_rating, 
                                      reverse=True)[:5]
                
                print("\n🏆 TOP 5 RATED CHOCOLATES:")
                for i, choc in enumerate(top_chocolates, 1):
                    print(f"{i}. {choc.name} ({choc.brand}) - ⭐ {choc.average_rating}")
        else:
            print("❌ No chocolates were scraped successfully")
            
    except KeyboardInterrupt:
        print("\n⏹️  Scraping interrupted by user")
        if scraper.chocolates_data:
            scraper.save_to_json("partial_cspot_data.json")
            print(f"Partial data saved ({len(scraper.chocolates_data)} chocolates)")
    
    except Exception as e:
        logger.error(f"Scraping failed: {e}")
        raise

if __name__ == "__main__":
    main()