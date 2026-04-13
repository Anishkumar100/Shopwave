# 🚀 ShopWave Deployment Guide

## Prerequisites
- Node.js >= 18.x
- MongoDB (local or MongoDB Atlas)
- Cashfree merchant account (sandbox for testing)
- Git

---

## 🛠️ Local Development Setup

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

#### Backend `.env`
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/mern_ecommerce
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_ENV=TEST
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FROM_EMAIL=noreply@shopwave.com
FROM_NAME=ShopWave
CLIENT_URL=http://localhost:5173
```

#### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_CASHFREE_ENV=TEST
```

### 3. Seed Database

```bash
cd backend
npm run seed:users    # Creates admin + sample users
npm run seed:products # Creates categories + 12 products
```

**Demo Credentials:**
- Admin: `admin@shopwave.com` / `Admin@123`
- User: `john@example.com` / `User@123`

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/health

---

## 💳 Cashfree Setup

1. Sign up at https://merchant.cashfree.com
2. Go to **Developers → API Keys**
3. Copy **App ID** and **Secret Key** (Test mode)
4. Set in backend `.env`:
   ```
   CASHFREE_APP_ID=TEST_CF_...
   CASHFREE_SECRET_KEY=TEST_...
   CASHFREE_ENV=TEST
   ```
5. For production, use live keys and set `CASHFREE_ENV=PRODUCTION`

---

## 🌐 Production Deployment

### Option A: Deploy to Render.com (Free tier)

#### Backend
1. Push code to GitHub
2. Create new **Web Service** on Render
3. Set root directory to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all environment variables from `.env`

#### Frontend
1. Create new **Static Site** on Render
2. Set root directory to `frontend`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`

### Option B: Deploy to Vercel + Railway

#### Backend (Railway)
```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
cd backend
railway init
railway up
```

#### Frontend (Vercel)
```bash
npm install -g vercel
cd frontend
vercel --prod
```

### Option C: VPS (Ubuntu + Nginx + PM2)

```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start server.js --name "shopwave-api"
pm2 save
pm2 startup

# Build frontend
cd frontend
npm run build
# Serve dist/ with Nginx

# Nginx config example:
# server {
#   listen 80;
#   server_name yourdomain.com;
#   root /var/www/shopwave/frontend/dist;
#   location /api { proxy_pass http://localhost:5000; }
# }
```

---

## 📦 Full Build Commands Summary

| Command | Description |
|---------|-------------|
| `cd backend && npm run dev` | Start backend (dev) |
| `cd backend && npm start` | Start backend (prod) |
| `cd backend && npm run seed:all` | Seed DB with users + products |
| `cd frontend && npm run dev` | Start frontend (dev) |
| `cd frontend && npm run build` | Build frontend for production |
| `cd frontend && npm run preview` | Preview production build |

---

## 🔑 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get profile |
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/orders` | Create order |
| GET | `/api/orders/myorders` | My orders |
| POST | `/api/payment/create-order` | Create Cashfree order |
| POST | `/api/payment/verify` | Verify payment |

Full API documentation: See individual route files in `backend/routes/`

---

## 🐛 Troubleshooting

- **MongoDB connection error**: Ensure MongoDB is running locally or check Atlas URI
- **Cashfree payment fails**: Verify you're using sandbox credentials and correct env
- **CORS errors**: Ensure `CLIENT_URL` in backend `.env` matches your frontend URL
- **JWT errors**: Make sure `JWT_SECRET` is at least 32 characters long
