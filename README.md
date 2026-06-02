# 🥗 AI Nutrition Dashboard — Assignment 1

A full-stack **AI-powered nutrition tracking dashboard** built with the **MEAN stack** (MongoDB, Express, Angular 17, Node.js) featuring OpenAI GPT-4o-mini integration and PDF report generation.

---

## ✨ Features

| Feature | Tech Used |
|---|---|
| User Authentication (JWT) | bcryptjs, jsonwebtoken |
| Food Logging (breakfast/lunch/dinner/snack) | Mongoose, Express |
| AI Nutrition Analysis | OpenAI GPT-4o-mini |
| AI Meal Suggestions | OpenAI GPT-4o-mini |
| Interactive Charts (macros, weekly trend) | Chart.js |
| **PDF Report Download** | pdfmake (server-side) |
| Water Intake Tracker | MongoDB |
| Food Database (30+ items, seeded) | MongoDB text search |
| Vercel Deployment Ready | `vercel.json` |

---

## 🏗 Tech Stack

- **M** – MongoDB (Mongoose 8)  
- **E** – Express.js 4.18  
- **A** – Angular 17 (Standalone components, Signals, `@if`/`@for` control flow)  
- **N** – Node.js (ESM)

---

## 🚀 Quick Start

### 1. Backend

```bash
cd backend
cp .env          # fill in MONGODB_URI, JWT_SECRET, OPENAI_API_KEY
npm install
npm run seed                   # seed 31 food items
npm run dev                    # starts on http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
npm install
npm start                      # starts on http://localhost:4200
```

---

## 🌐 Deploy to Vercel

### Backend
```bash
cd backend
cp .env           # set production values
vercel --prod
```
> Update `FRONTEND_URL` env var on Vercel to your Angular app's URL.

### Frontend
1. Build: `npm run build`
2. Deploy `dist/ai-nutrition-dashboard/` to **Vercel** / **Netlify**
3. Set `environment.prod.ts` → `apiUrl` to your backend Vercel URL

---

## 🔑 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/nutrition/today` | Today's log |
| POST | `/api/nutrition/log/entry` | Add food entry |
| GET | `/api/nutrition/weekly-summary` | 7-day stats |
| GET | `/api/nutrition/foods/search?q=` | Search foods |
| GET | `/api/ai/analyze` | AI nutrition analysis |
| POST | `/api/ai/meal-suggestions` | AI meal ideas |
| GET | `/api/pdf/report` | Download PDF report |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js              # Express entry point
│   ├── config/database.js
│   ├── models/             # User, NutritionLog, FoodItem
│   ├── controllers/        # auth, nutrition, ai, pdf
│   ├── routes/
│   ├── middleware/         # JWT auth, error handler
│   └── seed/foodItems.js
frontend/
└── src/app/
    ├── components/         # dashboard, food-log, ai-analysis, navbar, profile, auth
    ├── services/           # auth, nutrition, ai
    ├── models/             # TypeScript interfaces
    ├── guards/             # authGuard
    └── interceptors/       # JWT auth interceptor
```
