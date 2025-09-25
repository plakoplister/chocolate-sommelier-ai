# XOCOA Sommelier - Documentation technique

## Vue d'ensemble

XOCOA Sommelier est une application web intelligente de recommandation de chocolats utilisant l'IA (OpenAI GPT-4o) pour offrir une expérience conversationnelle naturelle et personnalisée.

## Architecture générale

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│ • Interface conversationnelle multilingue (FR/EN)          │
│ • Composants React optimisés                               │
│ • Gestion d'état des préférences utilisateur               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  API Layer (/api/chat.js)                  │
├─────────────────────────────────────────────────────────────┤
│ • Validation des requêtes                                  │
│ • Gestion des erreurs                                      │
│ • Interface avec Smart Hybrid Sommelier                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Smart Hybrid Sommelier Engine                 │
├─────────────────────────────────────────────────────────────┤
│ • Extraction de critères via OpenAI GPT-4o                │
│ • Filtrage local optimisé (2129 chocolats)                │
│ • Workflow intelligent de recommandation                   │
│ • Traduction automatique FR via GPT-4o-mini               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Base de données                           │
├─────────────────────────────────────────────────────────────┤
│ • chocolates.json (2129 chocolats, 106 champs)            │
│ • filters.json (filtres et taxonomies)                    │
│ • Support complet des awards et certifications            │
└─────────────────────────────────────────────────────────────┘
```

## Composants principaux

### 1. Smart Hybrid Sommelier (`src/services/smart-hybrid-sommelier.cjs`)

**Architecture hybride en 3 étapes :**

1. **Extraction de critères (OpenAI)** : Analyse le message utilisateur et extrait les critères de recherche
2. **Filtrage local (JavaScript)** : Applique les filtres sur la base de 2129 chocolats
3. **Décision intelligente (OpenAI)** : Détermine la suite selon le workflow

**Workflow intelligent :**
- 0 chocolats → Propose d'assouplir un critère
- 1-6 chocolats → Recommandations finales avec traductions FR
- 7+ chocolats → Demande un critère supplémentaire

### 2. Frontend React (`src/components/`)

**Structure des composants :**
```
src/components/
├── Chat/
│   ├── ChatInterface.js      # Interface principale de conversation
│   └── ChatMessage.js        # Affichage des messages
├── Recommendations/
│   ├── ChocolateCard.js      # Cartes de recommandation
│   └── ChocolateRecommendations.js
├── UI/
│   └── Header.js             # En-tête avec sélecteur de langue
└── LanguageSelector/
    └── LanguageSelector.js   # Commutateur FR/EN
```

### 3. Base de données

**chocolates.json** (9.3MB, 106 champs par chocolat) :
- Données complètes importées depuis Excel
- 2129 chocolats avec métadonnées riches
- Support des awards, certifications, accords mets-vins

**Champs principaux :**
- Identification : `id`, `name`, `brand`, `maker_name`
- Origine : `origin_country`, `origin_region`, `bean_variety`
- Caractéristiques : `cocoa_percentage`, `type`, `rating`
- Saveurs : `flavor_notes_primary/secondary/tertiary`
- Accords : `pairings_wine`, `pairings_spirits`, `pairings_cheese`
- Awards : `awards`, `awards_year`
- Dégustation : `tasting_notes`, `expert_review`

## Technologies utilisées

### Stack technique
- **Frontend** : Next.js 14, React 18, Tailwind CSS
- **Backend** : Next.js API Routes, Node.js
- **IA** : OpenAI GPT-4o (conversation), GPT-4o-mini (traductions)
- **Base de données** : JSON statique optimisée
- **Déploiement** : Netlify avec fonctions serverless

### Dépendances principales
```json
{
  "next": "14.2.32",
  "react": "^18",
  "openai": "^4.0.0",
  "tailwindcss": "^3.3.0"
}
```

## Flux de données

### 1. Interaction utilisateur
```
Utilisateur → ChatInterface → API /chat → SmartHybridSommelier
```

### 2. Traitement IA
```
Message → extractCriteriaWithAI() → filterChocolates() → makeDecisionWithAI()
```

### 3. Réponse
```
Recommandations → translateRecommendations() → ChocolateCard → Utilisateur
```

## Optimisations de performance

### 1. Traitement hybride
- **OpenAI** : Intelligence conversationnelle et extraction de critères
- **Local** : Filtrage rapide sur 2129 chocolats (< 10ms)
- **OpenAI-mini** : Traductions françaises économiques

### 2. Limitations intelligentes
- Max 6 recommandations finales (vs 10 avant)
- Tokens limités : 300 (extraction), 800 (décision), 600 (traduction)
- Température optimisée : 0.3 (précision) vs 0.8 (créativité)

### 3. Mise en cache
- Base de données chargée en mémoire au démarrage
- Filtres précalculés et optimisés
- Pas de requêtes DB répétées

## Sécurité

### Variables d'environnement
```
OPENAI_API_KEY=sk-...  # Clé API OpenAI (obligatoire)
```

### Validation
- Validation stricte des inputs utilisateur
- Sanitization des réponses OpenAI
- Gestion robuste des erreurs IA

## Déploiement

### Structure Netlify
```
netlify/
├── functions/
│   └── chat.js           # Fonction serverless pour l'API
└── netlify.toml          # Configuration de déploiement
```

### Variables de production
- `OPENAI_API_KEY` configurée dans Netlify
- Build automatique sur push GitHub
- Fonctions serverless pour l'API

## Maintenance et évolution

### Mise à jour de la base de données
1. Modifier `data/chocolates_database.xlsx`
2. Exécuter le script de réimport Python
3. Vérifier `data/chocolates.json` et `data/filters.json`
4. Tester en local puis déployer

### Ajout de nouvelles fonctionnalités
1. Modifier `SmartHybridSommelier` pour la logique métier
2. Adapter les composants React pour l'UI
3. Mettre à jour les prompts OpenAI si nécessaire

### Monitoring
- Logs d'erreur via console.error()
- Suivi des performances OpenAI
- Monitoring des taux d'erreur API

## Architecture des fichiers

### Structure finale (nettoyée)
```
SOMMELIER/
├── data/                     # Base de données
│   ├── chocolates.json      # 2129 chocolats (106 champs)
│   ├── filters.json         # Filtres et taxonomies
│   └── chocolates_database.xlsx
├── src/
│   ├── components/          # Composants React utilisés
│   ├── services/
│   │   └── smart-hybrid-sommelier.cjs  # Moteur principal
│   ├── pages/               # Pages et API Next.js
│   └── [autres modules utilisés]
├── Documents techniques/     # Documentation
├── TRASH/                   # Fichiers obsolètes déplacés
└── [config files]
```

## Métriques et performances

### Base de données
- **Taille** : 9.3MB (chocolates.json)
- **Chocolats** : 2129 entrées
- **Champs** : 106 par chocolat
- **Awards** : 984 chocolats avec distinctions

### Performance IA
- **Temps moyen** : 2-4 secondes par interaction
- **Modèles utilisés** : GPT-4o (principal), GPT-4o-mini (traductions)
- **Coût optimisé** : Tokens limités et modèles adaptés

---

*Document généré automatiquement - Version V5 - Septembre 2025*