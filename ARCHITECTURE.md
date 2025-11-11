# 🏗️ Application Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Galilio Application                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐              ┌──────────────────┐      │
│  │    Frontend     │◄────────────►│     Backend      │      │
│  │   React/Vite    │   REST API   │  Node.js/Express │      │
│  │  Port: 3000     │              │   Port: 5000     │      │
│  └─────────────────┘              └──────────────────┘      │
│         │                                   │                │
│         │                                   │                │
│         ▼                                   ▼                │
│  ┌─────────────────┐              ┌──────────────────┐      │
│  │   Browser       │              │   PostgreSQL     │      │
│  │   Storage       │              │   Database       │      │
│  │  (localStorage) │              │   Port: 5432     │      │
│  └─────────────────┘              └──────────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Tech Stack
- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Recharts** - Data visualization

### Folder Structure
```
frontend/src/
├── components/
│   ├── Layout.jsx         # Main layout wrapper
│   ├── Navbar.jsx         # Top navigation
│   └── Sidebar.jsx        # Side navigation
├── context/
│   └── AuthContext.jsx    # Auth state management
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Home.jsx
│   ├── History.jsx
│   ├── Admin.jsx
│   └── games/
│       ├── Dice.jsx
│       ├── Keno.jsx
│       ├── Limbo.jsx
│       ├── Crash.jsx
│       └── DragonTower.jsx
├── services/
│   └── api.js             # Axios instance
├── App.jsx                # Route configuration
└── main.jsx               # Entry point
```

### State Management
- **AuthContext** - Global auth state
- **Local State** - Component-specific state (useState)
- **localStorage** - Token persistence

### Routing
```
/ → /dashboard (if logged in) or /login
/login
/register
/dashboard
/games/dice
/games/keno
/games/limbo
/games/crash
/games/dragon-tower
/history
/admin (protected)
```

## Backend Architecture

### Tech Stack
- **Node.js & Express** - Server framework
- **PostgreSQL** - Relational database
- **Prisma** - ORM & migrations
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Winston** - Logging
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### Folder Structure
```
backend/src/
├── config/
│   └── prisma.js          # Database client
├── controllers/
│   ├── authController.js
│   ├── diceController.js
│   ├── kenoController.js
│   ├── limboController.js
│   ├── crashController.js
│   ├── dragonTowerController.js
│   └── adminController.js
├── middleware/
│   ├── auth.js            # JWT verification
│   ├── validation.js      # Input validation
│   ├── rateLimiter.js     # Rate limiting
│   └── logging.js         # Request logging
├── routes/
│   ├── authRoutes.js
│   ├── gameRoutes.js
│   ├── userRoutes.js
│   └── adminRoutes.js
├── services/
│   └── gameService.js     # Game logic
├── utils/
│   ├── rng.js             # Random number generation
│   └── logger.js          # Winston logger
└── server.js              # Express app
```

### API Routes
```
/api/auth/*        - Authentication
/api/games/*       - Game operations
/api/user/*        - User operations
/api/admin/*       - Admin operations
```

### Middleware Stack
1. **Helmet** - Security headers
2. **CORS** - Cross-origin control
3. **Morgan** - HTTP logging
4. **express.json()** - Body parsing
5. **Rate Limiter** - DDoS protection
6. **Auth Middleware** - JWT verification
7. **Validation** - Input validation

## Database Schema

```sql
User {
  id          String   @id @default(uuid())
  username    String   @unique
  email       String   @unique
  password    String   // bcrypt hashed
  balance     Decimal  @default(0)
  isAdmin     Boolean  @default(false)
  createdAt   DateTime @default(now())
  games       Game[]
}

Game {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId])
  gameType    String   // dice, keno, crash, etc.
  betAmount   Decimal
  payout      Decimal
  profit      Decimal
  gameData    Json     // Game-specific data
  createdAt   DateTime @default(now())
}
```

## Authentication Flow

```
1. User Registration/Login
   ↓
2. Backend validates credentials
   ↓
3. Backend generates JWT token
   ↓
4. Frontend stores token in localStorage
   ↓
5. Axios interceptor adds token to requests
   ↓
6. Backend verifies token on protected routes
   ↓
7. Access granted or 401 Unauthorized
```

## Game Flow Example (Dice)

```
Frontend                          Backend
   │                                │
   │──── POST /api/games/dice ─────►│
   │     { betAmount, target,       │
   │       rollOver }                │
   │                                 │
   │                                 ├─► Verify JWT
   │                                 ├─► Validate input
   │                                 ├─► Check balance
   │                                 ├─► Generate result (RNG)
   │                                 ├─► Calculate payout
   │                                 ├─► Update balance
   │                                 ├─► Save to database
   │                                 │
   │◄──── Response ─────────────────┤
   │     { result, payout,           │
   │       newBalance }              │
   │                                 │
   ├─► Update UI                     │
   ├─► Show toast                    │
   └─► Refresh balance               │
```

## Security Layers

### Frontend
1. **Route Guards** - Prevent unauthorized access
2. **Token Management** - Automatic refresh
3. **Input Validation** - Client-side checks
4. **XSS Protection** - React escapes by default

### Backend
1. **JWT Authentication** - Secure token-based auth
2. **Password Hashing** - bcrypt with salt
3. **Rate Limiting** - Prevent brute force
4. **Input Validation** - express-validator
5. **SQL Injection Protection** - Prisma ORM
6. **CORS** - Controlled cross-origin access
7. **Helmet** - Security headers

## Data Flow

### Reading Balance
```
Navbar Component
   ↓ (every 5s)
GET /api/user/balance
   ↓
Auth Middleware verifies token
   ↓
Query database for user
   ↓
Return balance
   ↓
Update Navbar display
```

### Playing a Game
```
Game Component
   ↓
User inputs (bet, options)
   ↓
POST /api/games/{game}
   ↓
Validate inputs
   ↓
Check user balance
   ↓
Generate provably fair result
   ↓
Calculate payout
   ↓
Update balance in database
   ↓
Save game record
   ↓
Return result
   ↓
Update UI & show notification
```

## Performance Optimizations

### Frontend
- **Code Splitting** - React.lazy() for routes
- **Memoization** - React.memo() for components
- **Debouncing** - Input handlers
- **Lazy Loading** - Images and components
- **Bundle Optimization** - Vite tree-shaking

### Backend
- **Connection Pooling** - Prisma connection pool
- **Caching** - In-memory for frequent queries
- **Rate Limiting** - Protect from abuse
- **Compression** - gzip responses
- **Query Optimization** - Efficient Prisma queries

## Scalability Considerations

### Horizontal Scaling
- **Stateless Backend** - Can run multiple instances
- **Load Balancer** - Distribute traffic
- **Database Replication** - Read replicas

### Vertical Scaling
- **Resource Optimization** - Efficient algorithms
- **Database Indexing** - Fast queries
- **Caching Layer** - Redis for sessions

## Monitoring & Logging

### Backend Logging
- **Winston** - Structured logging
- **Log Levels** - Error, warn, info, debug
- **Log Files** - Rotating file transport
- **Error Tracking** - Sentry integration

### Metrics
- **Prometheus** - Metrics collection
- **Custom Metrics** - Game-specific stats
- **Response Times** - API performance

## Development Workflow

```
1. Clone Repository
   ↓
2. Install Dependencies
   npm install (both folders)
   ↓
3. Configure Environment
   .env setup
   ↓
4. Database Setup
   npm run migrate
   npm run seed
   ↓
5. Start Development
   npm run dev (both)
   ↓
6. Make Changes
   Auto-reload with nodemon/vite
   ↓
7. Test Changes
   Manual testing
   ↓
8. Commit & Push
```

## Production Deployment

### Frontend
1. Build: `npm run build`
2. Deploy `dist/` folder to CDN
3. Configure environment variables
4. Set up HTTPS

### Backend
1. Set NODE_ENV=production
2. Use process manager (PM2)
3. Configure database (managed service)
4. Set up SSL/TLS
5. Configure monitoring
6. Set up backups

### Database
1. Managed PostgreSQL service
2. Automated backups
3. Connection pooling
4. Performance tuning

## Tech Decisions

### Why React?
- Component-based architecture
- Large ecosystem
- Great developer experience
- Virtual DOM performance

### Why Vite?
- Fast HMR (Hot Module Replacement)
- Modern build tool
- Great TypeScript support
- Optimized production builds

### Why PostgreSQL?
- ACID compliance
- JSON support
- Mature and reliable
- Great with Prisma

### Why Prisma?
- Type-safe database queries
- Auto-generated migrations
- Great developer experience
- Schema-first approach

### Why JWT?
- Stateless authentication
- Scalable across servers
- Self-contained tokens
- Industry standard

---

**Architecture Status:** ✅ Complete & Production-Ready
