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
- Check `backend/.env` has correct API credentials:
  - `NEURALSEEK_API_KEY` - For AI analysis
  - `ASSEMBLYAI_API_KEY` - For real-time transcription (get one free at https://www.assemblyai.com/)
- Check browser console for errors

**CORS errors?**
- Backend proxy must be running
- Frontend should point to `http://localhost:3001/api/analyze`

## 📦 Production Deployment

For Vercel:
1. Deploy normally - serverless functions in `/api/` handle everything
2. Set environment variables in Vercel dashboard:
   - `NEURALSEEK_API_KEY` - For AI analysis
   - `NEURALSEEK_AGENT` - Agent name (default: `pehla_agent`)
   - `ASSEMBLYAI_API_KEY` - For real-time transcription
3. No separate backend needed!

