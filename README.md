# Intrst - AI-Powered Finance Web App

A comprehensive MERN stack personal finance application that gamifies money management through AI-powered insights, goal tracking, and financial challenges.

## Features

### Dashboard
- **Financial Overview**: Real-time tracking of income, expenses, and net worth
- **AI Insights**: Personalized financial recommendations powered by LangChain
- **Interactive Charts**: Visual representation of financial data with Chart.js
- **Goal Sidebar**: Quick access to active financial goals with progress tracking

### AI Financial Advisor
- **Intelligent Chat**: Natural language conversations about finances
- **Contextual Advice**: Personalized recommendations based on user data
- **Visualization Generation**: AI-generated charts and insights
- **Multi-LLM Support**: Integration with OpenAI, Google GenAI, and Anthropic

### Financial Betting/Challenges
- **Gamified Goals**: Turn financial objectives into competitive challenges
- **Peer Competition**: Join public challenges or create private ones
- **Leaderboards**: Track performance against other users
- **Achievement System**: Earn points and badges for financial milestones
- **Stake-based Motivation**: Put money on the line to increase commitment

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** authentication with bcryptjs
- **LangChain** for AI orchestration
- **Stripe** for payment processing
- **Multer** for file uploads (CSV import)

### Frontend
- **React 18** with React Router DOM
- **Tailwind CSS** for styling
- **Chart.js** with react-chartjs-2 for visualizations
- **React Hook Form** for form management
- **React Hot Toast** for notifications
- **Lucide React** for icons

### AI Integration
- **OpenAI GPT-4** for financial advice
- **Google GenAI** (Gemini) for alternative insights
- **Anthropic Claude** for additional AI capabilities
- **LangChain** for AI workflow orchestration

## Prerequisites

- Node.js 16+ and npm
- MongoDB (local installation or MongoDB Atlas)
- OpenAI API key (optional, for AI features)
- Google GenAI API key (optional)
- Anthropic API key (optional)
- Stripe keys (optional, for payment features)

## Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd intrst
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=3001
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/intrst
   # Or use MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/intrst
   
   # JWT Secret (generate a secure random string)
   JWT_SECRET=your_jwt_secret_here_make_it_very_long_and_secure
   
   # AI API Keys (optional - remove if not using)
   OPENAI_API_KEY=your_openai_api_key_here
   GOOGLE_GENAI_API_KEY=your_google_genai_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   
   # Stripe (optional - remove if not using payments)
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
   ```

5. **Database Setup**
   
   Make sure MongoDB is running locally, or set up MongoDB Atlas:
   - For local MongoDB: Start the MongoDB service
   - For MongoDB Atlas: Create a cluster and get the connection string

6. **Start the application**
   
   **Development mode** (runs both backend and frontend):
   ```bash
   npm run dev
   ```
   
   **Or run separately:**
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Usage

### Getting Started
1. **Sign Up**: Create an account with email and password
2. **Onboarding**: Complete the 4-step onboarding process:
   - Personal information (age, life stage, primary goal)
   - Financial profile (income, expenses, savings, debt)
   - Investment preferences (risk tolerance, experience, timeline)
   - Notification preferences
3. **Dashboard**: View your financial overview and AI insights
4. **Set Goals**: Create financial goals in the sidebar
5. **Chat with AI**: Use the Advisor page for personalized advice
6. **Create Challenges**: Gamify your goals in the Betting section

### Key Features
- **Dashboard**: Monitor income, expenses, savings rate, and net worth
- **AI Advisor**: Ask questions about budgeting, investing, and saving
- **Goals Tracking**: Set and monitor progress on financial objectives
- **Challenges**: Create or join financial challenges with other users
- **Profile Management**: Update personal and financial information

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/onboarding` - Complete onboarding
- `GET /api/auth/me` - Get current user

### Dashboard
- `GET /api/dashboard/overview` - Financial overview with metrics
- `GET /api/dashboard/insights` - AI-generated insights

### AI Advisor
- `POST /api/advisor/chat` - Chat with AI advisor
- `POST /api/advisor/analyze-spending` - Spending pattern analysis
- `POST /api/advisor/goal-optimization` - Goal optimization advice

### Goals
- `GET /api/goals` - Get user goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Betting/Challenges
- `GET /api/bets/my-bets` - Get user's bets
- `GET /api/bets/leaderboard` - Get leaderboard
- `POST /api/bets` - Create new bet/challenge
- `PUT /api/bets/:id` - Update bet progress

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Add new transaction
- `POST /api/transactions/upload-csv` - Bulk import via CSV

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Protection against API abuse
- **Input Validation**: Comprehensive data validation
- **CORS Configuration**: Secure cross-origin requests

## UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Mode**: Support for user preferences (toggle amounts visibility)
- **Interactive Charts**: Dynamic financial visualizations
- **Real-time Updates**: Live data updates and notifications
- **Accessibility**: ARIA labels and keyboard navigation support

## AI Integration Details

The AI system uses LangChain to orchestrate multiple LLM providers:

- **Financial Advice**: Contextual recommendations based on user data
- **Spending Analysis**: Pattern recognition and optimization suggestions  
- **Goal Optimization**: Personalized strategies for achieving financial objectives
- **Visualization Generation**: AI-powered chart and graph creation
- **Natural Language Processing**: Understanding complex financial questions

## Gamification System

- **Points**: Earned through completing challenges and reaching milestones
- **Levels**: Progress through levels based on points accumulated
- **Achievements**: Unlock badges for specific accomplishments
- **Streaks**: Maintain consistency in financial habits
- **Leaderboards**: Compete with other users monthly
- **Challenges**: Stake-based financial competitions

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables for Production
Update your production environment with:
- `NODE_ENV=production`
- Secure database connection string
- Production API keys
- Secure JWT secret

### Recommended Hosting
- **Backend**: Heroku, Railway, or DigitalOcean
- **Frontend**: Vercel, Netlify, or serve from Express
- **Database**: MongoDB Atlas
- **Storage**: AWS S3 or similar (for file uploads)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions or support:
- Create an issue on GitHub
- Email: support@intrst.com (example)

## Roadmap

- [ ] Mobile app development (React Native)
- [ ] Advanced AI insights with market data
- [ ] Social features (friend challenges, groups)
- [ ] Integration with banks and financial institutions
- [ ] Investment tracking and portfolio management
- [ ] Tax optimization suggestions
- [ ] Automated savings recommendations

---

