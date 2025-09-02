"""
Flask Web Application for Chocolate Sommelier - English Version
Simple web interface to test the agent
"""

from flask import Flask, render_template, request, jsonify, session
import json
from chocolate_sommelier_agent_en import ChocolateSommelier, Chocolate, ChocolateType
import secrets

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

# Global sommelier instance
sommelier = ChocolateSommelier()
sommelier.initialize_database()

@app.route('/')
def index():
    """Home page"""
    return render_template('index_en.html')

@app.route('/start', methods=['POST'])
def start_consultation():
    """Start a new consultation"""
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
    """Process an answer and return next question or recommendations"""
    data = request.json
    answer = data.get('answer')
    question_id = data.get('question_id')
    
    # Save the answer
    if 'preferences' not in session:
        session['preferences'] = {}
    session['preferences'][question_id] = answer
    
    # Get questions
    questions = sommelier.ask_preferences()
    current = session.get('current_question', 0) + 1
    session['current_question'] = current
    
    if current < len(questions):
        # Next question
        return jsonify({
            'status': 'question',
            'question': questions[current],
            'progress': (current / len(questions)) * 100
        })
    else:
        # Generate recommendations
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
    """API to retrieve all chocolates"""
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
    print("🍫 CHOCOLATE SOMMELIER - WEB INTERFACE")
    print("="*60)
    print("\n📌 Open your browser at: http://localhost:5000")
    print("   (Ctrl+C to stop the server)\n")
    app.run(debug=True, port=5000)