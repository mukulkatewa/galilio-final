# 🚀 Galilio Frontend

Minimalistic authentication pages inspired by Stake.com design.

## Features

- ✨ Ultra-clean, minimal UI
- 🌙 Dark theme design
- 🔐 Login & Register pages
- 🎯 AuthContext for state management
- 📱 Mobile responsive
- 🔥 React Hot Toast notifications

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - API calls
- **React Hot Toast** - Toast notifications

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 3. Build for Production

```bash
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.jsx           # Main layout wrapper
│   │   ├── Navbar.jsx           # Top navbar with balance
│   │   └── Sidebar.jsx          # Left sidebar navigation
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication state management
│   ├── pages/
│   │   ├── Login.jsx            # Login page
│   │   ├── Register.jsx         # Register page
│   │   ├── Home.jsx             # Dashboard home page
│   │   ├── History.jsx          # Game history page
│   │   ├── Admin.jsx            # Admin panel (admin only)
│   │   └── games/
│   │       ├── Keno.jsx         # Keno game page
│   │       ├── Limbo.jsx        # Limbo game page
│   │       ├── Crash.jsx        # Crash game page
│   │       ├── DragonTower.jsx  # Dragon Tower game page
│   │       └── Dice.jsx         # Dice game page
│   ├── services/
│   │   └── api.js               # Axios instance with interceptors
│   ├── App.jsx                  # Main app with routing
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## API Integration

The frontend expects the following API endpoints:

### Login
- **POST** `/api/auth/login`
- Request: `{ username, password }`
- Response: `{ success, data: { user, token } }`

### Register
- **POST** `/api/auth/register`
- Request: `{ username, email, password }`
- Response: `{ success, data: { user, token } }`

### Balance
- **GET** `/api/user/balance`
- Headers: `{ Authorization: "Bearer {token}" }`
- Response: `{ success, data: { balance } }`
- Auto-refreshes every 5 seconds

## Routes

### Public Routes
- `/` - Redirects to `/dashboard` or `/login`
- `/login` - Login page
- `/register` - Register page

### Protected Routes (require authentication)
- `/dashboard` - Home page with game cards
- `/games/keno` - Keno game
- `/games/limbo` - Limbo game
- `/games/crash` - Crash game
- `/games/dragon-tower` - Dragon Tower game
- `/games/dice` - Dice game
- `/history` - Game history
- `/admin` - Admin panel (admin users only)

## Dashboard Features

### Top Navbar (Fixed)
- Logo: 🚀 Galilio
- Real-time balance display (auto-refresh every 5s)
- Username and logout button
- Dark theme: `#1e2433`

### Sidebar Navigation (Desktop)
- Fixed left sidebar (`w-64`)
- Game icons and names
- Active state highlighting
- Hover effects
- Admin menu item (visible only to admins)

### Mobile Navigation
- Bottom navigation bar
- Compact icon layout
- Responsive design

## Design System

### Colors
- Background: `#1a1f2e`
- Card Background: `#1e2433`
- Border: `#2d3748`
- Text Primary: `#e2e8f0`
- Text Secondary: `#a0aec0`
- Primary Blue: `#4299e1`
- Success Green: `#48bb78`
- Error Red: `#f56565`

### Components
- Buttons: rounded-lg, px-6, py-3, font-medium
- Inputs: rounded-lg, border, px-4, py-2
- Cards: rounded-xl, border, p-6

## Complete Features

### Authentication
✅ Login & Register pages with validation
✅ JWT token management in localStorage
✅ Protected route guards
✅ Auto token refresh on page reload

### Games
✅ **Dice** - Roll over/under with visual indicator
✅ **Keno** - 8x10 grid, pick 10 numbers, animated drawing
✅ **Limbo** - Target multiplier with comparison bar
✅ **Crash** - Animated line graph with auto cashout
✅ **Dragon Tower** - 3-column layout with difficulty levels

### Dashboard
✅ Navbar with real-time balance (auto-refresh every 5s)
✅ Sidebar navigation (desktop) / Bottom nav (mobile)
✅ Game selection grid
✅ User profile in navbar

### History & Admin
✅ Game history with pagination (20 per page)
✅ Admin dashboard with stats
✅ Game statistics table
✅ User management table

## Backend Integration

All API endpoints are integrated:
- Authentication: `/api/auth/*`
- Games: `/api/games/*`
- User: `/api/user/*`
- Admin: `/api/admin/*`

## Running with Backend

Ensure backend is running on port 5000:
```bash
cd ../backend
npm run dev
```

Then start frontend:
```bash
npm run dev
```

## Notes

- Token is stored in localStorage
- Axios interceptor adds Authorization header automatically
- Protected routes redirect to login if not authenticated
- Public routes redirect to dashboard if authenticated
- Balance auto-refreshes every 5 seconds in navbar
- All games use provably fair algorithms from backend
