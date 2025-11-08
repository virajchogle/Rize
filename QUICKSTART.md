# Quick Start Guide - Rize

## 🚀 Get Started in 3 Steps

### Step 1: Install Frontend Dependencies
```bash
npm install
```

### Step 2: Start Backend Proxy (Terminal 1)
```bash
cd backend
npm install
npm start
```
✅ Backend running on `http://localhost:3001`

### Step 3: Start Frontend (Terminal 2)
```bash
npm run dev
```
✅ Frontend running on `http://localhost:5173`

## 🎯 That's It!

Open `http://localhost:5173` in Chrome or Edge and start using Rize!

## 📝 What Changed?

- **Backend Proxy**: Added to avoid CORS issues with NeuralSeek API
- **Frontend**: Now calls the backend proxy instead of API directly
- **Production**: Vercel serverless function handles API calls automatically

## 🔧 Troubleshooting

**API not working?**
- Make sure backend is running on port 3001
- Check `backend/.env` has correct API credentials
- Check browser console for errors

**CORS errors?**
- Backend proxy must be running
- Frontend should point to `http://localhost:3001/api/analyze`

## 📦 Production Deployment

For Vercel:
1. Deploy normally - serverless function in `/api/analyze.js` handles everything
2. Set `NEURALSEEK_API_KEY` and `NEURALSEEK_AGENT` in Vercel dashboard
3. No separate backend needed!

