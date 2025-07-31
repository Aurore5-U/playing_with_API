from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import requests
import random
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'mental_health_app_secret_key_2024'

# Temporary storage for journal entries
journal_entries = []

# Mood to tag mapping for quote API
MOOD_TAGS = {
    'happy': ['happiness', 'joy', 'success'],
    'sad': ['wisdom', 'hope', 'inspirational'],
    'anxious': ['peace', 'calm', 'mindfulness'],
    'stressed': ['motivational', 'strength', 'perseverance'],
    'grateful': ['gratitude', 'thankfulness', 'appreciation'],
    'motivated': ['success', 'achievement', 'goals'],
    'lonely': ['friendship', 'love', 'connection'],
    'angry': ['patience', 'forgiveness', 'peace']
}

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/mood', methods=['GET', 'POST'])
def mood():
    if request.method == 'POST':
        selected_mood = request.form.get('mood')
        session['current_mood'] = selected_mood
        return redirect(url_for('quote'))
    return render_template('mood.html')

@app.route('/journal', methods=['GET', 'POST'])
def journal():
    if request.method == 'POST':
        entry_text = request.form.get('journal_entry')
        if entry_text:
            journal_entry = {
                'text': entry_text,
                'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'mood': session.get('current_mood', 'neutral')
            }
            journal_entries.append(journal_entry)
        return redirect(url_for('journal'))
    
    return render_template('journal.html', entries=journal_entries)

@app.route('/quote')
def quote():
    current_mood = session.get('current_mood', 'happy')
    return render_template('quote.html', mood=current_mood)

@app.route('/api/quote/<mood>')
def get_quote(mood):
    try:
        # Try to get a quote from Quotable API with mood-based tags
        tags = MOOD_TAGS.get(mood.lower(), ['inspirational'])
        tag = random.choice(tags)
        
        # Primary API: Quotable
        url = f"https://api.quotable.io/random?tags={tag}&maxLength=150"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return jsonify({
                'quote': data['content'],
                'author': data['author'],
                'success': True
            })
        else:
            # Fallback to ZenQuotes
            zen_url = "https://zenquotes.io/api/random"
            zen_response = requests.get(zen_url, timeout=10)
            
            if zen_response.status_code == 200:
                zen_data = zen_response.json()
                return jsonify({
                    'quote': zen_data[0]['q'],
                    'author': zen_data[0]['a'],
                    'success': True
                })
            else:
                # Final fallback with hardcoded quotes
                fallback_quotes = {
                    'happy': ("The best time to plant a tree was 20 years ago. The second best time is now.", "Chinese Proverb"),
                    'sad': ("Every cloud has a silver lining.", "John Milton"),
                    'anxious': ("You are braver than you believe, stronger than you seem, and smarter than you think.", "A.A. Milne"),
                    'stressed': ("It does not matter how slowly you go as long as you do not stop.", "Confucius"),
                    'grateful': ("Gratitude turns what we have into enough.", "Anonymous"),
                    'motivated': ("The only impossible journey is the one you never begin.", "Tony Robbins"),
                    'lonely': ("Be yourself; everyone else is already taken.", "Oscar Wilde"),
                    'angry': ("Holding on to anger is like grasping a hot coal with the intent of throwing it at someone else; you are the one who gets burned.", "Buddha")
                }
                
                quote_data = fallback_quotes.get(mood.lower(), fallback_quotes['happy'])
                return jsonify({
                    'quote': quote_data[0],
                    'author': quote_data[1],
                    'success': True
                })
    
    except Exception as e:
        return jsonify({
            'quote': "The greatest glory in living lies not in never falling, but in rising every time we fall.",
            'author': "Nelson Mandela",
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
