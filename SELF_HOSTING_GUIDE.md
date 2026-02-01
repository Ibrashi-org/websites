# MOOKI Store - Self-Hosting Guide

## 🚀 Quick Deploy (Free Hosting)

### Step 1: MongoDB Atlas (Free Database)
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create free account → Create free cluster (M0)
3. Create database user (save username/password)
4. Get connection string: `mongodb+srv://username:password@cluster.xxxxx.mongodb.net/mooki_store`

### Step 2: Deploy Backend on Render.com (Free)
1. Go to [render.com](https://render.com) → Sign up free
2. New → Web Service → Connect GitHub repo
3. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `MONGO_URL` = your MongoDB Atlas connection string
   - `DB_NAME` = mooki_store
   - `JWT_SECRET` = your-secret-key-here
   - `CORS_ORIGINS` = https://your-frontend-url.vercel.app
5. Deploy → Copy your backend URL (e.g., `https://mooki-api.onrender.com`)

### Step 3: Deploy Frontend on Vercel (Free)
1. Go to [vercel.com](https://vercel.com) → Sign up free
2. Import → Select GitHub repo
3. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Create React App
4. Add Environment Variable:
   - `REACT_APP_BACKEND_URL` = https://mooki-api.onrender.com (your Render URL)
5. Deploy → Get your frontend URL

### Step 4: Connect Custom Domain (Namecheap)
1. In Vercel: Settings → Domains → Add your domain
2. In Namecheap: Add DNS records as shown by Vercel
3. Wait for SSL certificate (automatic)

---

## 📁 Project Structure

```
mooki-store/
├── backend/
│   ├── server.py          # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── .env.example       # Environment template
├── frontend/
│   ├── src/               # React source code
│   ├── public/            # Static files
│   ├── package.json       # Node dependencies
│   └── .env.example       # Environment template
└── README.md              # This file
```

---

## 🔧 Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Edit with your values
uvicorn server:app --reload --port 8001
```

### Frontend
```bash
cd frontend
yarn install
cp .env.example .env      # Edit with your values
yarn start
```

---

## 🔐 Admin Access
- **URL:** /admin
- **Username:** admin
- **Password:** admin123

⚠️ **Change admin password** after first login!

---

## 📧 Email Setup (Optional)
To enable order confirmation emails:
1. Sign up at [resend.com](https://resend.com)
2. Get API key
3. Add to backend environment:
   - `RESEND_API_KEY` = your-api-key
   - `SENDER_EMAIL` = your-verified-email

---

## 🆘 Troubleshooting

**Backend not connecting to database?**
- Check MONGO_URL format
- Whitelist IP in MongoDB Atlas (0.0.0.0/0 for any)

**Frontend not reaching backend?**
- Verify REACT_APP_BACKEND_URL is correct
- Check CORS_ORIGINS includes frontend domain

**Images not loading?**
- Ensure image URLs are accessible (use direct links)

---

## 💰 Estimated Costs

| Service | Cost |
|---------|------|
| MongoDB Atlas | Free (512MB) |
| Render.com | Free (spins down after inactivity) |
| Vercel | Free |
| Namecheap Domain | ~$10/year |
| **Total** | **~$10/year** |

---

Made with ❤️ for MOOKI Store
