import React, { useState, useEffect } from 'react';
import { Brain, Home, Heart, BookOpen, Quote, ArrowRight, Sparkles } from 'lucide-react';

interface JournalEntry {
  id: string;
  text: string;
  date: string;
  mood: string;
}

interface QuoteData {
  quote: string;
  author: string;
}

const MOOD_TAGS: Record<string, string[]> = {
  happy: ['happiness', 'joy', 'success'],
  sad: ['wisdom', 'hope', 'inspirational'],
  anxious: ['peace', 'calm', 'mindfulness'],
  stressed: ['motivational', 'strength', 'perseverance'],
  grateful: ['gratitude', 'thankfulness', 'appreciation'],
  motivated: ['success', 'achievement', 'goals'],
  lonely: ['friendship', 'love', 'connection'],
  angry: ['patience', 'forgiveness', 'peace']
};

const FALLBACK_QUOTES: Record<string, QuoteData> = {
  happy: { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  sad: { quote: "Every cloud has a silver lining.", author: "John Milton" },
  anxious: { quote: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "A.A. Milne" },
  stressed: { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  grateful: { quote: "Gratitude turns what we have into enough.", author: "Anonymous" },
  motivated: { quote: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  lonely: { quote: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
  angry: { quote: "Holding on to anger is like grasping a hot coal with the intent of throwing it at someone else; you are the one who gets burned.", author: "Buddha" }
};

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentMood, setCurrentMood] = useState<string>('');
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [currentQuote, setCurrentQuote] = useState<QuoteData | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);

  const fetchQuote = async (mood: string) => {
    setIsLoadingQuote(true);
    try {
      const tags = MOOD_TAGS[mood.toLowerCase()] || ['inspirational'];
      const tag = tags[Math.floor(Math.random() * tags.length)];
      
      // Try Quotable API first
      const response = await fetch(`https://api.quotable.io/random?tags=${tag}&maxLength=150`);
      
      if (response.ok) {
        const data = await response.json();
        setCurrentQuote({
          quote: data.content,
          author: data.author
        });
      } else {
        // Fallback to ZenQuotes
        const zenResponse = await fetch('https://zenquotes.io/api/random');
        if (zenResponse.ok) {
          const zenData = await zenResponse.json();
          setCurrentQuote({
            quote: zenData[0].q,
            author: zenData[0].a
          });
        } else {
          // Final fallback
          setCurrentQuote(FALLBACK_QUOTES[mood.toLowerCase()] || FALLBACK_QUOTES.happy);
        }
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      setCurrentQuote(FALLBACK_QUOTES[mood.toLowerCase()] || FALLBACK_QUOTES.happy);
    } finally {
      setIsLoadingQuote(false);
    }
  };

  const handleMoodSelect = (mood: string) => {
    setCurrentMood(mood);
    setCurrentPage('quote');
    fetchQuote(mood);
  };

  const handleJournalSubmit = (text: string) => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      text,
      date: new Date().toLocaleString(),
      mood: currentMood || 'neutral'
    };
    setJournalEntries(prev => [newEntry, ...prev]);
  };

  const renderNavigation = () => (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-green-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-green-500" />
            <h1 className="text-2xl font-bold text-gray-800">MindfulMe</h1>
          </div>
          <div className="flex space-x-6">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'mood', label: 'Mood', icon: Heart },
              { id: 'journal', label: 'Journal', icon: BookOpen },
              { id: 'quote', label: 'Quotes', icon: Quote }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentPage(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === id
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );

  const renderHomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-100 to-blue-100 py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="mb-8">
            <Sparkles className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Welcome to MindfulMe 🌱
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Your personal mental health companion
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
              Take a moment to check in with yourself. Track your mood, write in your journal, 
              and find inspiration through motivational quotes tailored to how you're feeling.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setCurrentPage('mood')}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                😊 Check Your Mood
              </button>
              <button
                onClick={() => setCurrentPage('journal')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                📝 Start Journaling
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            How MindfulMe Helps You
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: '😊',
                title: 'Mood Tracking',
                description: 'Monitor your emotional well-being by tracking how you feel throughout your journey.'
              },
              {
                icon: '📝',
                title: 'Personal Journal',
                description: 'Express your thoughts and feelings in a safe, private space designed for reflection.'
              },
              {
                icon: '💫',
                title: 'Inspirational Quotes',
                description: 'Discover motivational quotes that resonate with your current mood and mindset.'
              },
              {
                icon: '🌱',
                title: 'Personal Growth',
                description: 'Build healthy habits and develop emotional awareness through consistent self-care.'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 border border-gray-100"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-100 to-blue-100 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Begin Your Wellness Journey?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Start by checking in with your current mood and see what insights await you.
          </p>
          <button
            onClick={() => setCurrentPage('mood')}
            className="bg-green-500 hover:bg-green-600 text-white px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Get Started Today 🚀
          </button>
        </div>
      </div>
    </div>
  );

  const renderMoodPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            How are you feeling today? 😊
          </h1>
          <p className="text-lg text-gray-600">
            Select the mood that best describes your current emotional state
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { mood: 'happy', emoji: '😊', label: 'Happy', description: 'Feeling joyful and content', color: 'border-yellow-300 hover:bg-yellow-50' },
            { mood: 'sad', emoji: '😢', label: 'Sad', description: 'Feeling down or melancholy', color: 'border-blue-300 hover:bg-blue-50' },
            { mood: 'anxious', emoji: '😰', label: 'Anxious', description: 'Feeling worried or nervous', color: 'border-red-300 hover:bg-red-50' },
            { mood: 'stressed', emoji: '😵', label: 'Stressed', description: 'Feeling overwhelmed', color: 'border-orange-300 hover:bg-orange-50' },
            { mood: 'grateful', emoji: '🙏', label: 'Grateful', description: 'Feeling thankful', color: 'border-purple-300 hover:bg-purple-50' },
            { mood: 'motivated', emoji: '💪', label: 'Motivated', description: 'Feeling energized', color: 'border-green-300 hover:bg-green-50' },
            { mood: 'lonely', emoji: '😔', label: 'Lonely', description: 'Feeling isolated', color: 'border-gray-300 hover:bg-gray-50' },
            { mood: 'angry', emoji: '😠', label: 'Angry', description: 'Feeling frustrated', color: 'border-red-400 hover:bg-red-50' }
          ].map(({ mood, emoji, label, description, color }) => (
            <button
              key={mood}
              onClick={() => handleMoodSelect(mood)}
              className={`bg-white p-6 rounded-xl border-2 ${color} transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl`}
            >
              <div className="text-4xl mb-3">{emoji}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{label}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </button>
          ))}
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-green-500">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">💡 Why Track Your Mood?</h3>
          <p className="text-gray-600">
            Understanding your emotional patterns helps you identify triggers, celebrate positive moments, 
            and develop healthier coping strategies for challenging times.
          </p>
        </div>
      </div>
    </div>
  );

  const renderJournalPage = () => {
    const [journalText, setJournalText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (journalText.trim()) {
        handleJournalSubmit(journalText);
        setJournalText('');
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Your Personal Journal 📝
            </h1>
            <p cla
