// Main JavaScript for MindfulMe App

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initializeApp();
});

function initializeApp() {
    // Add smooth scrolling to all anchor links
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add loading states to all forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '⏳ Processing...';
                submitBtn.disabled = true;
                
                // Re-enable after a delay to prevent multiple submissions
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 2000);
            }
        });
    });

    // Add hover effects to cards
    const cards = document.querySelectorAll('.feature-card, .mood-card, .entry-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Add typing animation to hero text
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        animateText(heroTitle);
    }

    // Initialize mood selection feedback
    initializeMoodFeedback();
    
    // Initialize journal counter
    initializeJournalCounter();
}

function animateText(element) {
    const text = element.textContent;
    element.textContent = '';
    element.style.borderRight = '2px solid #48bb78';
    
    let i = 0;
    const timer = setInterval(() => {
        element.textContent += text[i];
        i++;
        
        if (i >= text.length) {
            clearInterval(timer);
            setTimeout(() => {
                element.style.borderRight = 'none';
            }, 500);
        }
    }, 100);
}

function initializeMoodFeedback() {
    const moodCards = document.querySelectorAll('.mood-card');
    moodCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Add visual feedback
            const mood = this.querySelector('h3').textContent.toLowerCase();
            showMoodFeedback(mood);
        });
    });
}

function showMoodFeedback(mood) {
    // Create temporary feedback element
    const feedback = document.createElement('div');
    feedback.className = 'mood-feedback';
    feedback.innerHTML = `
        <div class="feedback-content">
            <h3>Great choice! 😊</h3>
            <p>Finding quotes that match your ${mood} mood...</p>
        </div>
    `;
    
    // Style the feedback
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem;
        border-radius: 16px;
        box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        text-align: center;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(feedback);
    
    // Remove after 2 seconds
    setTimeout(() => {
        feedback.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(feedback);
        }, 300);
    }, 2000);
}

function initializeJournalCounter() {
    const textarea = document.querySelector('.journal-textarea');
    if (textarea) {
        // Add character counter
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.style.cssText = `
            text-align: right;
            color: #718096;
            font-size: 0.9rem;
            margin-top: 0.5rem;
        `;
        
        textarea.parentNode.appendChild(counter);
        
        const updateCounter = () => {
            const length = textarea.value.length;
            counter.textContent = `${length} characters`;
            
            if (length > 500) {
                counter.style.color = '#48bb78';
                counter.textContent += ' - Great progress! 🎉';
            }
        };
        
        textarea.addEventListener('input', updateCounter);
        updateCounter();
    }
}

// Utility functions for quote page
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : '#f56565'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        to { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Export functions for use in other scripts
window.MindfulMe = {
    showNotification,
    showMoodFeedback
};
