# 🍫 Agent IA Sommelier du Chocolat

Un système de recommandation intelligent pour le chocolat fin, basé sur les données du site C-SPOT.

## 📁 Fichiers créés

### 1. `chocolate_sommelier_agent.py`
Agent classique avec questionnaire structuré :
- Pose 7 questions ciblées sur vos préférences
- Système de scoring pour matcher les chocolats
- Base de données intégrée (à enrichir avec scraping)
- Interface CLI interactive

**Utilisation :**
```bash
python chocolate_sommelier_agent.py
```

### 2. `chocolate_ai_chatbot.py`
Version conversationnelle plus naturelle :
- Dialogue libre avec l'IA sommelier
- Analyse contextuelle des préférences
- Recommandations personnalisées et détaillées
- Style chaleureux et éducatif

**Utilisation :**
```bash
python chocolate_ai_chatbot.py
```

## 🚀 Installation

```bash
# Installer les dépendances
pip install requests beautifulsoup4 openai
```

## 💡 Comment ça marche

### Architecture du système

1. **Collecte de données** (Scraper)
   - Récupère les chocolats depuis C-SPOT
   - Parse les reviews, notes et caractéristiques
   - Construit une base de données locale

2. **Profilage utilisateur**
   - Questions sur l'expérience, goûts, budget
   - Analyse des réponses pour créer un profil
   - Adaptation au niveau de connaissance

3. **Moteur de recommandation**
   - Scoring multi-critères (goût, origine, prix)
   - Matching chocolat-préférences
   - Classement des meilleures options

4. **Présentation personnalisée**
   - Descriptions adaptées au niveau
   - Conseils de dégustation
   - Suggestions d'accords

## 🔧 Personnalisation

### Enrichir la base de données

Modifier la méthode `load_chocolate_data()` pour ajouter plus de chocolats :

```python
Chocolate(
    name="Nom du chocolat",
    brand="Marque",
    origin="Pays",
    cocoa_percentage=70,
    type=ChocolateType.DARK,
    flavor_notes=["note1", "note2"],
    rating=4.5,
    price_range="€€",
    description="Description",
    url="URL C-SPOT"
)
```

### Ajuster les questions

Modifier `ask_preferences()` pour personnaliser le questionnaire.

### Affiner le scoring

Adapter `calculate_match_score()` pour vos critères de matching.

## 🎯 Fonctionnalités clés

- **Questionnaire intelligent** : S'adapte au niveau de l'utilisateur
- **Recommandations scorées** : Algorithme de matching précis  
- **Mode conversationnel** : Dialogue naturel avec l'IA
- **Base de connaissances** : Origines, marques, profils aromatiques
- **Conseils de dégustation** : Accords et techniques
- **Export des préférences** : Sauvegarde du profil utilisateur

## 📊 Exemples de profils aromatiques

- **Madagascar** : Fruits rouges, acidité vive
- **Pérou** : Fruité, floral, notes de miel
- **Venezuela** : Noisette, caramel, équilibré
- **Équateur** : Floral intense, jasmin
- **Ghana** : Cacao pur, classique

## 🔮 Évolutions possibles

1. **Interface web** avec Flask/Django
2. **App mobile** React Native
3. **API REST** pour intégration
4. **Machine Learning** pour affiner les recommandations
5. **Scraping temps réel** des dernières reviews C-SPOT
6. **Système de notation** par les utilisateurs
7. **Recommandations collaboratives** basées sur profils similaires
8. **Intégration e-commerce** pour achat direct

## 📝 Notes

- Les données d'exemple sont fictives mais représentatives
- Pour production : implémenter le scraping complet de C-SPOT
- Respecter les conditions d'utilisation du site source
- Considérer la mise en cache des données scrapées

## 🤝 Contribution

N'hésitez pas à enrichir la base de données ou améliorer les algorithmes de recommandation !