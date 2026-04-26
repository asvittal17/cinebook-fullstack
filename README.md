# 🎬 CineBook — Full Stack Movie Ticket Booking App

A production-ready movie ticket booking platform built with the MERN stack, featuring real-time seat locking, Stripe payments, Clerk authentication, and city-based theater filtering across India.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Clerk account (free)
- Stripe account (test mode)
- Inngest account (free)

---

## 📁 Project Structure

```
cinebook/
├── server/          # Node.js + Express + MongoDB
│   ├── config/      # DB, Inngest setup
│   ├── controllers/ # Business logic
│   ├── middleware/  # Auth (Clerk JWT)
│   ├── models/      # Mongoose schemas
│   ├── routes/      # API endpoints
│   ├── seed.js      # Database seeder
│   └── server.js    # Entry point
└── client/          # React + Vite + Tailwind
    └── src/
        ├── components/
        │   ├── admin/   # Admin UI components
        │   ├── common/  # Navbar, Footer
        │   └── user/    # MovieCard, SeatSelector, Hero
        ├── context/     # CityContext
        ├── pages/
        │   ├── admin/   # Dashboard, Movies, Theaters, Shows, Bookings
        │   └── user/    # Home, MovieDetail, Shows, Seats, Checkout, Success, Bookings
        └── services/    # API calls (axios)
```

---

## ⚙️ Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Fill in your credentials in .env
npm run dev
```

### Server .env
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cinebook
CLERK_WEBHOOK_SECRET=whsec_...
CLERK_SECRET_KEY=sk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
EMAIL_USER=you@gmail.com
EMAIL_PASS=your_app_password
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...
CLIENT_URL=http://localhost:5173
```

### Seed the Database
```bash
cd server
node seed.js
# Creates 16 theaters across 6 cities + 6 sample movies
```

---

## ⚛️ Frontend Setup

```bash
cd client
npm install
cp .env.example .env
# Fill in your Clerk and Stripe keys
npm run dev
```

### Client .env
```env
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🔑 Clerk Setup

1. Create app at [clerk.com](https://clerk.com)
2. Enable Email, Google, and Phone sign-in methods
3. Copy `publishableKey` → client `.env`
4. Copy `secretKey` → server `.env`
5. Set up webhook: `POST /api/webhooks/clerk` (for user sync)
6. To make a user admin, set public metadata:
```json
{ "role": "admin" }
```
Via Clerk Dashboard → Users → Select user → Metadata

---

## 💳 Stripe Setup

1. Create account at [stripe.com](https://stripe.com)
2. Copy publishable key → client `.env`
3. Copy secret key → server `.env`
4. For webhooks (optional local testing):
```bash
stripe listen --forward-to localhost:5000/api/webhooks/stripe
```
5. Test card: `4242 4242 4242 4242` | Exp: `12/34` | CVV: `123`

---

## 📧 Inngest Setup (Background Jobs)

1. Create account at [inngest.com](https://inngest.com)
2. Copy event key + signing key → server `.env`
3. For local dev:
```bash
npx inngest-cli@latest dev -u http://localhost:5000/api/inngest
```

Background jobs:
- `booking/confirmed` → sends confirmation email
- `seats/locked` → auto-releases after 10 min
- `show/reminder` → sends reminder 24h before show

---

## 🌐 API Endpoints

### Movies
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/movies` | — | List all movies (filter: genre, language, search) |
| GET | `/api/movies/now-showing` | — | Movies with active shows |
| GET | `/api/movies/:id` | — | Movie details |
| POST | `/api/movies` | Admin | Add movie |
| PUT | `/api/movies/:id` | Admin | Update movie |
| DELETE | `/api/movies/:id` | Admin | Soft delete |

### Theaters
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/theaters` | — | List (filter: city) |
| GET | `/api/theaters/cities` | — | Available cities |
| POST | `/api/theaters` | Admin | Add theater |
| PUT | `/api/theaters/:id` | Admin | Update |
| DELETE | `/api/theaters/:id` | Admin | Soft delete |

### Shows
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/shows/movie/:id` | — | Shows by movie (filter: date, city) |
| GET | `/api/shows/:id` | — | Show details + all seats |
| POST | `/api/shows` | Admin | Create show (auto-generates 120 seats) |
| POST | `/api/shows/:id/lock-seats` | User | Lock seats for 10 min |
| POST | `/api/shows/:id/release-seats` | User | Release locked seats |

### Bookings
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/bookings` | User | Create booking + Stripe PaymentIntent |
| POST | `/api/bookings/confirm` | User | Confirm after payment |
| GET | `/api/bookings/my` | User | User's booking history |
| GET | `/api/bookings/all` | Admin | All bookings (paginated) |
| GET | `/api/bookings/analytics` | Admin | Revenue & stats |
| PATCH | `/api/bookings/:id/cancel` | User | Cancel + auto-refund |

---

## 🎭 Seat Layout

Each show auto-generates **120 seats** (10 rows × 12 columns):

```
          SCREEN

   1  2  3  4  5  6 | 7  8  9 10 11 12
A  [Standard — ₹180]
B  [Standard — ₹180]
C  [Standard — ₹180]
D  [Premium  — ₹280]
E  [Premium  — ₹280]
F  [Premium  — ₹280]
G  [Premium  — ₹280]
H  [Recliner — ₹450]
I  [Recliner — ₹450]
J  [Recliner — ₹450]
```

- 🟢 Green = Available
- 🟡 Yellow = Your selection
- 🟠 Orange = Locked by another user (10 min hold)
- 🔴 Red = Booked

---

## 🏙️ Cities Supported (Pre-seeded)

| City | Theaters |
|------|----------|
| Mumbai | PVR Juhu, INOX Nariman Point, Cinepolis Andheri |
| Delhi | PVR Select Citywalk, INOX Rajiv Chowk, Cinepolis DLF |
| Bangalore | PVR Forum Koramangala, INOX Garuda Mall |
| Hyderabad | PVR GVK One, Cinepolis Manjeera |
| Chennai | PVR SPI Palazzo, AGS Cinemas |
| Pune | PVR Phoenix, INOX Inorbit |
| Kolkata | INOX South City, Cinepolis Acropolis |

---

## 🚀 Deployment

### Backend → Railway
```bash
# railway.toml
[build]
  command = "npm install"
[deploy]
  startCommand = "npm start"
```

### Frontend → Vercel
```bash
npm run build
# Deploy dist/ folder to Vercel
# Set environment variables in Vercel dashboard
```

### Database → MongoDB Atlas
- Free M0 cluster supports up to 512MB storage
- Enable network access from anywhere (0.0.0.0/0) for Railway

---

## 🧪 Testing Locally

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Inngest dev server
npx inngest-cli@latest dev -u http://localhost:5000/api/inngest

# Terminal 3 — Frontend
cd client && npm run dev
```

Visit: http://localhost:5173

---

## 📱 Features Summary

### User
- ✅ Browse movies (filter by genre, language, search)
- ✅ Auto-rotating hero banner
- ✅ Movie detail page with cast
- ✅ City-based show filtering
- ✅ Date picker (7 days ahead)
- ✅ Interactive 120-seat grid
- ✅ 10-minute seat lock timer
- ✅ Stripe checkout with coupons
- ✅ Booking confirmation ticket
- ✅ Cancellation with refund
- ✅ Email notifications

### Admin
- ✅ Analytics dashboard (revenue chart, top movies)
- ✅ Full movie CRUD
- ✅ Theater management (city-wise)
- ✅ Show scheduling
- ✅ Booking management with filters

---

Built with ❤️ using MERN + Clerk + Stripe + Inngest + Tailwind CSS
