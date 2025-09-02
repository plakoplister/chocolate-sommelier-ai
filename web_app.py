"""
Application Web Flask pour le Sommelier du Chocolat
Interface web simple pour tester l'agent
"""

from flask import Flask, render_template, request, jsonify, session
import json
from chocolate_sommelier_agent import ChocolateSommelier, Chocolate, ChocolateType
import secrets

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

# Instance globale du sommelier
sommelier = ChocolateSommelier()
sommelier.initialize_database()

@app.route('/')
def index():
    """Page d'accueil"""
    return render_template('index.html')

@app.route('/start', methods=['POST'])
def start_consultation():
    """Démarre une nouvelle consultation"""
    session['preferences'] = {}
    session['current_question'] = 0
    questions = sommelier.ask_preferences()
    return jsonify({
        'status': 'started',
        'question': questions[0] if questions else None,
        'total_questions': len(questions)
    })

@app.route('/answer', methods=['POST'])
def process_answer():
    """Traite une réponse et renvoie la question suivante ou les recommandations"""
    data = request.json
    answer = data.get('answer')
    question_id = data.get('question_id')
    
    # Sauvegarder la réponse
    if 'preferences' not in session:
        session['preferences'] = {}
    session['preferences'][question_id] = answer
    
    # Obtenir les questions
    questions = sommelier.ask_preferences()
    current = session.get('current_question', 0) + 1
    session['current_question'] = current
    
    if current < len(questions):
        # Question suivante
        return jsonify({
            'status': 'question',
            'question': questions[current],
            'progress': (current / len(questions)) * 100
        })
    else:
        # Générer les recommandations
        recommendations = sommelier.recommend(session['preferences'], top_n=3)
        results = []
        for choco, score in recommendations:
            results.append({
                'name': choco.name,
                'brand': choco.brand,
                'origin': choco.origin,
                'cocoa': choco.cocoa_percentage,
                'type': choco.type.value,
                'flavors': choco.flavor_notes,
                'rating': choco.rating,
                'price': choco.price_range,
                'description': choco.description,
                'score': round(score),
                'url': choco.url
            })
        
        return jsonify({
            'status': 'recommendations',
            'results': results
        })

@app.route('/api/chocolates')
def get_chocolates():
    """API pour récupérer tous les chocolats"""
    chocolates = []
    for choco in sommelier.chocolate_database:
        chocolates.append({
            'name': choco.name,
            'brand': choco.brand,
            'origin': choco.origin,
            'cocoa': choco.cocoa_percentage,
            'flavors': ', '.join(choco.flavor_notes),
            'rating': choco.rating
        })
    return jsonify(chocolates)

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🍫 SOMMELIER DU CHOCOLAT - INTERFACE WEB")
    print("="*60)
    print("\n📌 Ouvrez votre navigateur à : http://localhost:5000")
    print("   (Ctrl+C pour arrêter le serveur)\n")
    app.run(debug=True, port=5000)