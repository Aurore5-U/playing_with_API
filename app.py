from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
import requests
import random
from datetime import datetime
import json
import os

app = Flask(__name__)
app.secret_key = 'mental_health_app_secret_key_2024'

# File-based storage for persistence
DATA_DIR = 'data'
JOURNAL_FILE = os.path.join(DATA_DIR, 'journal_entries.json')
MOOD_FILE = os.path.join(DATA_DIR, 'mood_history.json')

# Create data directory if it doesn't exist
os.makedirs(DATA_DIR, exist_ok=True)

# Initialize data files if they don't exist
if not os.path.exists(JOURNAL_FILE):
    with open(JOURNAL_FILE, 'w') as f:
        json.dump([], f)

if not os.path.exists(MOOD_FILE):
    with open(MOOD_FILE, 'w') as f:
        json.dump([], f)

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

FALLBACK_QUOTES = {
    'happy': [
        {"quote": "The best time to plant a tree was 20 years ago. The second best time is now.", "author": "Chinese Proverb"},
        {"quote": "Happiness is not something ready made. It comes from your own actions.", "author": "Dalai Lama"}
    ],
    'sad': [
        {"quote": "Every cloud has a silver lining.", "author": "John Milton"},
        {"quote": "The wound is the place where the Light enters you.", "author": "Rumi"}
    ],
    'anxious': [
        {"quote": "You are braver than you believe, stronger than you seem, and smarter than you think.", "author": "A.A. Milne"},
        {"quote": "Anxiety is the dizziness of freedom.", "author": "Søren Kierkegaard"}
    ],
    'stressed': [
        {"quote": "It does not matter how slowly you go as long as you do not stop.", "author": "Confucius"},
        {"quote": "The greatest weapon against stress is our ability to choose one thought over another.", "author": "William James"}
    ],
    'grateful': [
        {"quote": "Gratitude turns what we have into enough.", "author": "Anonymous"},
        {"quote": "Be thankful for what you have; you'll end up having more.", "author": "Oprah Winfrey"}
    ],
    'motivated': [
        {"quote": "The only impossible journey is the one you never begin.", "author": "Tony Robbins"},
        {"quote": "Success is not final, failure is not fatal: it is the courage to continue that counts.", "author": "Winston Churchill"}
    ],
    'lonely': [
        {"quote": "Be yourself; everyone else is already taken.", "author": "Oscar Wilde"},
        {"quote": "The greatest thing in the world is to know how to belong to oneself.", "author": "Michel de Montaigne"}
    ],
    'angry': [
        {"quote": "Holding on to anger is like grasping a hot coal with the intent of throwing it at someone else; you are the one who gets burned.", "author": "Buddha"},
        {"quote": "For every minute you remain angry, you give up sixty seconds of peace of mind.", "author": "Ralph Waldo Emerson"}
    ]
}

def load_journal_entries():
    try:
        with open(JOURNAL_FILE, 'r') as f:
            return json.load(f)
    except:
        return []

def save_journal_entries(entries):
    with open(JOURNAL_FILE, 'w') as f:
        json.dump(entries, f, indent=2)

def load_mood_history():
    try:
        with open(MOOD_FILE, 'r') as f:
            return json.load(f)
    except:
        return []

def save_mood_history(history):
    with open(MOOD_FILE, 'w') as f:
        json.dump(history, f, indent=2)

def get_quote_for_mood(mood):
    try:
        # Try to get a quote from Quotable API with mood-based tags
        tags = MOOD_TAGS.get(mood.lower(), ['inspirational'])
        tag = random.choice(tags)
        
        # Primary API: Quotable
        url = f"https://api.quotable.io/random?tags={tag}&maxLength=150"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return {
                'quote': data['content'],
                'author': data['author'],
                'success': True
            }
        else:
            # Fallback to ZenQuotes
            zen_url = "https://zenquotes.io/api/random"
            zen_response = requests.get(zen_url, timeout=10)
            
            if zen_response.status_code == 200:
                zen_data = zen_response.json()
                return {
                    'quote': zen_data[0]['q'],
                    'author': zen_data[0]['a'],
                    'success': True
                }
            else:
                # Final fallback with hardcoded quotes
                fallback_quotes = FALLBACK_QUOTES.get(mood.lower(), FALLBACK_QUOTES['happy'])
                quote_data = random.choice(fallback_quotes)
                return {
                    'quote': quote_data['quote'],
                    'author': quote_data['author'],
                    'success': True
                }
    
    except Exception as e:
        fallback_quotes = FALLBACK_QUOTES.get(mood.lower(), FALLBACK_QUOTES['happy'])
        quote_data = random.choice(fallback_quotes)
        return {
            'quote': quote_data['quote'],
            'author': quote_data['author'],
            'success': False,
            'error': str(e)
        }

@app.route('/')
def home():
    journal_entries = load_journal_entries()
    mood_history = load_mood_history()
    
    stats = {
        'journal_count': len(journal_entries),
        'mood_count': len(mood_history),
        'weeks_tracked': len(set(entry.get('date', '').split()[0] for entry in mood_history)) if mood_history else 0
    }
    
    return render_template('home.html', stats=stats)

@app.route('/mood', methods=['GET', 'POST'])
def mood():
    if request.method == 'POST':
        selected_mood = request.form.get('mood')
        if selected_mood:
            # Save mood to history
            mood_history = load_mood_history()
            new_mood_entry = {
                'mood': selected_mood,
                'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'timestamp': datetime.now().timestamp()
            }
            mood_history.insert(0, new_mood_entry)
            # Keep only last 100 entries
            mood_history = mood_history[:100]
            save_mood_history(mood_history)
            
            session['current_mood'] = selected_mood
            flash(f'Mood set to {selected_mood.title()}!', 'success')
            return redirect(url_for('quote'))
    
    # Get recent mood history for display
    mood_history = load_mood_history()
    recent_moods = mood_history[:10]  # Show last 10 moods
    
    return render_template('mood.html', recent_moods=recent_moods)

@app.route('/journal', methods=['GET', 'POST'])
def journal():
    if request.method == 'POST':
        entry_text = request.form.get('journal_entry')
        if entry_text and entry_text.strip():
            journal_entries = load_journal_entries()
            journal_entry = {
                'id': str(int(datetime.now().timestamp() * 1000)),
                'text': entry_text.strip(),
                'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                'mood': session.get('current_mood', 'neutral'),
                'timestamp': datetime.now().timestamp()
            }
            journal_entries.insert(0, journal_entry)
            save_journal_entries(journal_entries)
            flash('Journal entry saved successfully!', 'success')
        else:
            flash('Please write something in your journal entry.', 'error')
        return redirect(url_for('journal'))
    
    # Handle search and filtering
    search_term = request.args.get('search', '').strip()
    filter_mood = request.args.get('filter_mood', 'all')
    sort_by = request.args.get('sort_by', 'newest')
    
    journal_entries = load_journal_entries()
    
    # Apply search filter
    if search_term:
        journal_entries = [
            entry for entry in journal_entries 
            if search_term.lower() in entry['text'].lower() or 
               search_term.lower() in entry.get('mood', '').lower()
        ]
    
    # Apply mood filter
    if filter_mood != 'all':
        journal_entries = [
            entry for entry in journal_entries 
            if entry.get('mood', '') == filter_mood
        ]
    
    # Apply sorting
    if sort_by == 'oldest':
        journal_entries.sort(key=lambda x: x.get('timestamp', 0))
    elif sort_by == 'mood':
        journal_entries.sort(key=lambda x: x.get('mood', ''))
    else:  # newest (default)
        journal_entries.sort(key=lambda x: x.get('timestamp', 0), reverse=True)
    
    # Get unique moods for filter dropdown
    all_entries = load_journal_entries()
    unique_moods = sorted(set(entry.get('mood', '') for entry in all_entries if entry.get('mood')))
    
    return render_template('journal.html', 
                         entries=journal_entries, 
                         search_term=search_term,
                         filter_mood=filter_mood,
                         sort_by=sort_by,
                         unique_moods=unique_moods)

@app.route('/quote')
def quote():
    current_mood = session.get('current_mood', 'happy')
    quote_data = get_quote_for_mood(current_mood)
    
    return render_template('quote.html', 
                         mood=current_mood, 
                         quote_data=quote_data)

@app.route('/quote/<mood>')
def quote_for_mood(mood):
    session['current_mood'] = mood
    quote_data = get_quote_for_mood(mood)
    flash(f'Quote updated for {mood.title()} mood!', 'success')
    
    return render_template('quote.html', 
                         mood=mood, 
                         quote_data=quote_data)

@app.route('/analytics')
def analytics():
    journal_entries = load_journal_entries()
    mood_history = load_mood_history()
    
    if not mood_history:
        return render_template('analytics.html', 
                             has_data=False,
                             stats={})
    
    # Calculate mood distribution
    mood_counts = {}
    for entry in mood_history:
        mood = entry.get('mood', 'unknown')
        mood_counts[mood] = mood_counts.get(mood, 0) + 1
    
    total_entries = len(mood_history)
    most_common_mood = max(mood_counts.items(), key=lambda x: x[1])[0] if mood_counts else 'none'
    
    # Calculate unique days
    unique_dates = set()
    for entry in mood_history:
        date_str = entry.get('date', '')
        if date_str:
            date_part = date_str.split()[0]  # Get just the date part
            unique_dates.add(date_part)
    
    days_active = len(unique_dates)
    
    # Prepare mood distribution for template (sorted by count)
    mood_distribution = sorted(mood_counts.items(), key=lambda x: x[1], reverse=True)
    
    # Calculate percentages
    mood_percentages = []
    for mood, count in mood_distribution:
        percentage = (count / total_entries) * 100 if total_entries > 0 else 0
        mood_percentages.append({
            'mood': mood,
            'count': count,
            'percentage': round(percentage, 1)
        })
    
    stats = {
        'total_checkins': total_entries,
        'journal_entries': len(journal_entries),
        'most_common_mood': most_common_mood,
        'days_active': days_active,
        'mood_distribution': mood_percentages,
        'recent_moods': mood_history[:5],
        'recent_entries': journal_entries[:3]
    }
    
    return render_template('analytics.html', 
                         has_data=True,
                         stats=stats)

# API endpoint for getting quotes (for potential future use)
@app.route('/api/quote/<mood>')
def api_get_quote(mood):
    quote_data = get_quote_for_mood(mood)
    return jsonify(quote_data)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
