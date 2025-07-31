# MindfulMe - Mental Health Web Application

A comprehensive mental health companion web application that helps users track their mood, maintain a personal journal, discover inspirational quotes, and analyze their wellness patterns through detailed analytics.

## 🌟 Features

### Core Functionality
- **Mood Tracking**: Select from 8 different emotional states with visual feedback
- **Personal Journaling**: Write, search, filter, and sort journal entries
- **Inspirational Quotes**: AI-powered quote generation based on current mood
- **Wellness Analytics**: Comprehensive insights into mental health patterns
- **Data Persistence**: Local storage ensures data persists between sessions

### Advanced Features
- **Multi-API Integration**: Uses Quotable.io and ZenQuotes APIs with intelligent fallbacks
- **Smart Search & Filtering**: Advanced journal entry management
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Analytics**: Live mood distribution and activity tracking
- **Error Handling**: Graceful handling of API failures and network issues

## 🚀 APIs Used

### Primary APIs
1. **[Quotable.io](https://quotable.io)** - Primary source for inspirational quotes
   - Endpoint: `https://api.quotable.io/random?tags={tag}&maxLength=150`
   - Features: Tag-based filtering, length limits, comprehensive quote database

2. **[ZenQuotes.io](https://zenquotes.io)** - Backup quote source
   - Endpoint: `https://zenquotes.io/api/random`
   - Features: Reliable fallback, diverse quote collection

### API Integration Strategy
- **Intelligent Fallbacks**: If primary API fails, automatically switches to backup
- **Local Fallbacks**: Curated local quote database for offline functionality
- **Error Handling**: Comprehensive error management for API failures
- **Rate Limiting**: Respectful API usage with proper error handling

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Storage**: Browser localStorage
- **Deployment**: Docker containerization

## 📦 Installation & Local Development

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mindfulme-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open your browser to `http://localhost:5173`

### Build for Production
```bash
npm run build
npm run preview
```

## 🐳 Docker Deployment

### Part 2A: Docker Containerization & Hub Deployment

#### Image Details
- **Docker Hub Repository**: `<your-dockerhub-username>/mindfulme-app`
- **Image Tags**: `v1`, `v1.1`, `latest`
- **Base Image**: `node:18-alpine`
- **Exposed Port**: 8080

#### Build Instructions

1. **Build the Docker image locally**
   ```bash
   docker build -t <dockerhub-username>/mindfulme-app:v1 .
   ```

2. **Test locally**
   ```bash
   docker run -p 8080:8080 <dockerhub-username>/mindfulme-app:v1
   curl http://localhost:8080  # Verify it works
   ```

3. **Push to Docker Hub**
   ```bash
   docker login
   docker push <dockerhub-username>/mindfulme-app:v1
   docker tag <dockerhub-username>/mindfulme-app:v1 <dockerhub-username>/mindfulme-app:latest
   docker push <dockerhub-username>/mindfulme-app:latest
   ```

#### Deploy on Lab Machines

1. **SSH into web-01 and web-02**
   ```bash
   ssh user@web-01
   ssh user@web-02
   ```

2. **Pull and run on each server**
   ```bash
   # On both web-01 and web-02
   docker pull <dockerhub-username>/mindfulme-app:v1
   docker run -d --name mindfulme-app --restart unless-stopped -p 8080:8080 <dockerhub-username>/mindfulme-app:v1
   ```

3. **Verify internal accessibility**
   ```bash
   curl http://web-01:8080
   curl http://web-02:8080
   ```

#### Load Balancer Configuration

1. **Update HAProxy configuration** (`/etc/haproxy/haproxy.cfg`)
   ```haproxy
   global
       daemon
       maxconn 4096

   defaults
       mode http
       timeout connect 5000ms
       timeout client 50000ms
       timeout server 50000ms

   frontend mindfulme_frontend
       bind *:80
       default_backend mindfulme_backend

   backend mindfulme_backend
       balance roundrobin
       option httpchk GET /
       server web01 172.20.0.11:8080 check
       server web02 172.20.0.12:8080 check
   ```

2. **Reload HAProxy**
   ```bash
   docker exec -it lb-01 sh -c 'haproxy -sf $(pidof haproxy) -f /etc/haproxy/haproxy.cfg'
   ```

#### Testing & Verification

1. **Test load balancing**
   ```bash
   # Run multiple requests to verify round-robin distribution
   for i in {1..10}; do
     curl -s http://localhost | grep -o "web-0[12]" || echo "Request $i"
     sleep 1
   done
   ```

2. **Verify both servers are responding**
   ```bash
   # Check server headers or add server identification
   curl -I http://localhost
   ```

3. **Monitor HAProxy stats** (if configured)
   ```bash
   curl http://localhost:8404/stats
   ```

## 🔒 Security Considerations

### API Key Management
- **No API Keys Required**: Both Quotable.io and ZenQuotes.io are public APIs
- **Rate Limiting**: Implemented respectful usage patterns
- **Error Handling**: Graceful degradation when APIs are unavailable

### Data Security
- **Local Storage**: All user data stored locally in browser
- **No Server Storage**: No personal data transmitted to external servers
- **Privacy First**: Complete user privacy and data ownership

### Production Hardening (Optional)
If API keys were required, implement:
```bash
# Environment variable injection
docker run -d --name mindfulme-app \
  -e API_KEY=${API_KEY} \
  -p 8080:8080 \
  <dockerhub-username>/mindfulme-app:v1
```

## 📊 Application Architecture

### Component Structure
```
src/
├── App.tsx                 # Main application component
├── components/            # Reusable components (if expanded)
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── styles/               # Additional styling (if needed)
```

### Data Flow
1. **User Interaction** → Component State Updates
2. **API Calls** → External quote services
3. **Local Storage** → Data persistence
4. **Analytics** → Real-time data processing

## 🎯 User Experience Features

### Mood Tracking
- 8 distinct emotional states with visual indicators
- Historical mood tracking with date stamps
- Quick mood selection with immediate feedback

### Journal Management
- **Search**: Full-text search across all entries
- **Filter**: Filter by mood or date range
- **Sort**: Multiple sorting options (newest, oldest, by mood)
- **Character Count**: Real-time typing feedback

### Quote System
- **Mood-Based**: Quotes tailored to current emotional state
- **Multiple Sources**: Primary and backup API integration
- **Offline Support**: Local fallback quotes for reliability

### Analytics Dashboard
- **Mood Distribution**: Visual representation of emotional patterns
- **Activity Tracking**: Days active and engagement metrics
- **Insights**: Personalized recommendations based on usage patterns

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] All navigation links work correctly
- [ ] Mood selection triggers quote generation
- [ ] Journal entries save and persist
- [ ] Search and filter functionality works
- [ ] Analytics display correct data
- [ ] Responsive design on mobile devices
- [ ] API fallbacks work when primary APIs fail

### Load Balancer Testing
- [ ] Both servers receive requests in round-robin fashion
- [ ] Server failure handling (take one server down)
- [ ] Health checks working properly
- [ ] Session persistence (if implemented)

## 🚀 Deployment Evidence

### Screenshots to Capture
1. **Local Development**: Application running on localhost:5173
2. **Docker Build**: Successful image build process
3. **Docker Hub**: Published image on Docker Hub
4. **Server Deployment**: Application running on both web servers
5. **Load Balancer**: HAProxy configuration and stats
6. **End-to-End Testing**: Multiple requests showing load distribution

### Log Evidence
```bash
# Docker build logs
docker build -t mindfulme-app:v1 . > build.log

# Deployment logs
docker logs mindfulme-app > deployment.log

# Load balancer logs
docker exec lb-01 cat /var/log/haproxy.log > haproxy.log
```

## 🎥 Demo Video Script (2 minutes)

### Segment 1: Local Development (30 seconds)
- Show application running locally
- Demonstrate mood selection and quote generation
- Quick journal entry creation

### Segment 2: Core Features (60 seconds)
- Mood tracking with different emotions
- Journal search and filtering
- Analytics dashboard with insights
- API integration demonstration

### Segment 3: Deployment (30 seconds)
- Show Docker container running
- Demonstrate load balancer distributing requests
- Verify both servers responding

## 🤝 Credits & Attribution

### APIs
- **[Quotable.io](https://quotable.io)** - Primary quote API service
- **[ZenQuotes.io](https://zenquotes.io)** - Backup quote service

### Libraries & Tools
- **React** - Frontend framework
- **Tailwind CSS** - Styling framework
- **Lucide React** - Icon library
- **Vite** - Build tool and development server

### Inspiration
- Mental health awareness and digital wellness tools
- Modern web application design patterns
- Accessibility and user experience best practices

## 📈 Future Enhancements

### Potential Features
- **Data Export**: Export journal entries and mood data
- **Themes**: Multiple color themes for personalization
- **Reminders**: Mood check-in notifications
- **Social Features**: Anonymous mood sharing (optional)
- **Advanced Analytics**: Trend analysis and predictions

### Technical Improvements
- **PWA Support**: Offline functionality and app-like experience
- **Database Integration**: Server-side data storage option
- **Authentication**: User accounts and cloud sync
- **API Caching**: Improved performance with quote caching

## 📞 Support & Contact

For questions, issues, or contributions:
- **GitHub Issues**: Use the repository issue tracker
- **Documentation**: Refer to this README for comprehensive guidance
- **API Documentation**: Check respective API documentation for service-specific issues

---

**Note**: This application is designed for educational and personal wellness purposes. It is not a substitute for professional mental health care. If you're experiencing serious mental health issues, please consult with a qualified healthcare professional.
