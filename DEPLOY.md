# 🚌 Q-Less — Deployment Guide

Deploy the full stack for **free** using Render.

---

## 📁 Folder Structure

```
qless/                        ← your GitHub repo root
├── render.yaml               ← Render blueprint (auto-deploys everything)
├── qless-backend/            ← Node.js + Express API
│   ├── src/
│   ├── package.json
│   └── ...
└── qless-frontend/           ← React + Vite
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx           ← your connected frontend
    │   └── api.js
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Deploy to Render (Free)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial Q-Less commit"
git remote add origin https://github.com/YOUR_USERNAME/qless.git
git push -u origin main
```

### Step 2 — Create Render account

Go to [render.com](https://render.com) and sign up free.

### Step 3 — New Blueprint

1. Click **New → Blueprint**
2. Connect your GitHub repo
3. Render detects `render.yaml` and auto-creates:
   - ✅ PostgreSQL database (`qless-db`)
   - ✅ Backend API (`qless-api`)
   - ✅ Frontend static site (`qless-frontend`)
4. Click **Apply**

### Step 4 — Run migrations + seed

Once the backend is live, open the Render **Shell** tab on `qless-api` and run:

```bash
npm run db:migrate
npm run db:seed
```

### Step 5 — Add SMS credentials (optional)

In the Render dashboard → `qless-api` → Environment:

| Key | Value |
|-----|-------|
| `AT_API_KEY` | Your Africa's Talking API key |
| `AT_USERNAME` | Your AT username |
| `AT_SENDER_ID` | `Q-Less` |

---

## 💻 Run Locally (Development)

### 1. Start PostgreSQL

Make sure PostgreSQL is running locally, then:

```bash
createdb qless_db
```

### 2. Start the backend

```bash
cd qless-backend
cp .env.example .env     # fill in your DB credentials
npm install
npm run db:migrate
npm run db:seed
npm run dev              # runs on http://localhost:5000
```

### 3. Start the frontend

```bash
cd qless-frontend
npm install
npm run dev              # runs on http://localhost:3000
```

The Vite proxy forwards all `/api` requests to `localhost:5000` automatically.

---

## 🌍 Custom Domain (optional)

1. In Render → `qless-frontend` → Settings → Custom Domains
2. Add `qless.co.za` (or your domain)
3. Update your DNS: add a CNAME pointing to the Render URL
4. Update `CLIENT_URL` in `qless-api` env vars to match

---

## 🔄 Continuous Deployment

Once connected to GitHub, every `git push` to `main` automatically:
- Rebuilds and redeploys the frontend
- Restarts the backend with zero downtime

---

## 📊 Free Tier Limits (Render)

| Resource | Free Limit | Notes |
|----------|-----------|-------|
| PostgreSQL | 1 GB storage | Enough for thousands of bookings |
| Backend | 750 hrs/month | Sleeps after 15min inactivity |
| Frontend | Unlimited | Static hosting, always on |

> 💡 **Tip**: Upgrade the backend to the **Starter plan (R130/mo)** to avoid cold starts in production.

---

## 🧪 Demo Credentials

After seeding:

| Role | Phone | Password |
|------|-------|----------|
| Commuter | `0720000001` | `Commuter@123` |
| Driver | `0711000001` | `Driver@123` |
