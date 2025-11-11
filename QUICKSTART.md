# ⚡ Quick Start Guide

## First Time Setup (5 minutes)

### 1. Install Dependencies
```bash
# Run automated setup
setup.bat
```

### 2. Configure Backend
Edit `backend\.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/galilio_db?schema=public"
JWT_SECRET=your_secure_random_string_here
```

### 3. Setup Database
```bash
cd backend
npm run migrate
npm run seed
```

## Running the Application

### Option 1: Start Everything at Once
```bash
start-all.bat
```

### Option 2: Start Separately
```bash
# Terminal 1 - Backend
start-backend.bat

# Terminal 2 - Frontend  
start-frontend.bat
```

## Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Admin Panel:** http://localhost:3000/admin

## Default Login

- **Username:** `admin`
- **Password:** `Admin@123`
- **Balance:** $1,000.00

## Test the Games

1. Login with admin credentials
2. Click on any game from the dashboard
3. Place bets and play
4. Check your history in the History tab
5. View stats in Admin panel (admin only)

## Common Commands

### Backend
```bash
cd backend
npm run dev      # Start development server
npm run migrate  # Run database migrations
npm run seed     # Seed initial data
npm run studio   # Open Prisma Studio
```

### Frontend
```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
```

## Quick Troubleshooting

**❌ Database connection failed:**
- Start PostgreSQL service
- Check DATABASE_URL in backend/.env

**❌ Port 5000 already in use:**
- Change PORT in backend/.env

**❌ Port 3000 already in use:**
- Change port in frontend/vite.config.js

**❌ JWT errors:**
- Set unique JWT_SECRET in backend/.env

**❌ CORS errors:**
- Ensure backend is running
- Check FRONTEND_URL in backend/.env

## File Structure

```
galilio/
├── setup.bat              # Initial setup script
├── start-all.bat          # Start both servers
├── start-backend.bat      # Start backend only
├── start-frontend.bat     # Start frontend only
├── SETUP.md              # Detailed setup guide
├── QUICKSTART.md         # This file
├── backend/
│   ├── .env              # Backend configuration
│   └── prisma/           # Database schema
└── frontend/
    └── src/              # React application
```

## Next Steps

- 📖 Read [SETUP.md](SETUP.md) for detailed information
- 🎮 Play all 5 games
- 📊 Check admin dashboard
- 🧪 Test game history
- 🔧 Customize game rules in backend controllers

---

**Need Help?** Check SETUP.md or backend/logs/ for errors.
