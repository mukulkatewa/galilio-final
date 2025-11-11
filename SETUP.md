# 🚀 Galilio Application - Setup Guide

Complete setup guide for the Galilio application with backend and frontend.

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Database Setup

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL if not already installed
# Create a new database
createdb galilio_db

# Or using psql
psql -U postgres
CREATE DATABASE casino_db;
\q
```

#### Option B: Docker PostgreSQL
```bash
cd backend
docker-compose -f docker-compose.db.yml up -d
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env
# Edit .env file with your configuration

# Run database migrations
npm run migrate

# Seed initial data (creates admin user)
npm run seed

# Start backend server
npm run dev
```

Backend will run on http://localhost:5000

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

Frontend will run on http://localhost:3000

## ⚙️ Environment Configuration

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://postgres:password@localhost:5432/casino_db?schema=public"

# JWT
JWT_SECRET=your_secure_jwt_secret_change_this
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000

# Optional
SENTRY_DSN=your_sentry_dsn_here
PROMETHEUS_METRICS_ENABLED=false

# Admin User (for seeding)
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@casino.com
ADMIN_PASSWORD=Admin@123
```

### Frontend

Frontend environment is configured in `vite.config.js` with proxy settings pointing to backend.

## 🎮 Default Credentials

After running `npm run seed` in backend:

- **Username**: admin
- **Email**: admin@galilio.com
- **Password**: Admin@123
- **Balance**: $1000.00

## 📡 API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user
- POST `/api/auth/logout` - Logout user

### Games
- POST `/api/games/dice` - Play Dice game
- POST `/api/games/keno` - Play Keno game
- POST `/api/games/limbo` - Play Limbo game
- POST `/api/games/crash` - Play Crash game
- POST `/api/games/dragon-tower/init` - Initialize Dragon Tower
- POST `/api/games/dragon-tower` - Play Dragon Tower

### User
- GET `/api/user/balance` - Get user balance
- GET `/api/user/history` - Get game history

### Admin (Admin only)
- GET `/api/admin/stats` - Get game statistics
- GET `/api/admin/users` - Get all users
- POST `/api/admin/adjust-balance` - Adjust user balance

## 🎯 Game Rules

### 🎲 Dice
- Choose target number (1-99)
- Select Roll Over or Roll Under
- Win if outcome matches your prediction
- House edge: 1%

### 🎱 Keno
- Pick 10 numbers from 1-80
- 20 numbers are drawn
- Win based on matches:
  - 4 matches: 1x
  - 5 matches: 2x
  - 6 matches: 10x
  - 7 matches: 50x
  - 8 matches: 200x
  - 9 matches: 1000x
  - 10 matches: 5000x

### 🎯 Limbo
- Set target multiplier
- Game generates random multiplier
- Win if generated ≥ target
- House edge: 1%

### 🚀 Crash
- Multiplier starts at 1.00x and increases
- Can crash at any moment
- Cash out before crash to win
- Optional auto cash out feature
- House edge: 1%

### 🐉 Dragon Tower
- Climb tower by selecting correct tiles
- Each level has eggs (safe) and bombs (lose)
- Difficulty levels:
  - Easy: 3 eggs/4 tiles, 8 levels
  - Medium: 2 eggs/4 tiles, 10 levels
  - Hard: 1 egg/4 tiles, 12 levels
- Cash out anytime or complete all levels

## 🔧 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists

### Port Already in Use
- Backend (5000): Change PORT in .env
- Frontend (3000): Change port in vite.config.js

### CORS Errors
- Ensure FRONTEND_URL in backend .env matches frontend URL
- Check backend is running before starting frontend

### Migration Errors
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev
npm run seed
```

## 📊 Admin Panel

Access admin dashboard at http://localhost:3000/admin

Features:
- View total house profit, wagered, games played
- Game-by-game statistics
- User management
- Real-time metrics

## 🛠️ Development

### Backend
```bash
npm run dev      # Start with nodemon
npm run start    # Start production
npm run migrate  # Run migrations
npm run studio   # Open Prisma Studio
npm run seed     # Seed database
```

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

## 📱 Production Deployment

### Backend
1. Set NODE_ENV=production
2. Use strong JWT_SECRET
3. Set up proper DATABASE_URL
4. Configure Sentry for error tracking
5. Enable rate limiting
6. Use PM2 or similar for process management

### Frontend
1. Update API URL in production
2. Build: `npm run build`
3. Deploy dist folder to CDN/hosting
4. Configure proper CORS on backend

## 📝 Notes

- All games use provably fair algorithms
- House edge is 1% on most games
- Balances are stored with 2 decimal precision
- Games are logged in database for history
- Admin can view all statistics

## 🆘 Support

For issues or questions:
1. Check troubleshooting section
2. Review backend logs in `backend/logs/`
3. Check browser console for frontend errors
4. Verify all environment variables are set

---

Happy Gaming! 🎰
