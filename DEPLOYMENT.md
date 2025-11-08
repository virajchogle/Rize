# Deployment Guide - Rize

## 🚀 Quick Deploy to Vercel (Recommended)

Vercel is the easiest option since we have a serverless function set up.

### Step 1: Prepare Your Code

1. **Make sure all files are committed:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   ```

2. **Push to GitHub/GitLab/Bitbucket:**
   ```bash
   git push origin main
   ```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd call-transcription-app
   vercel
   ```

4. **Follow the prompts:**
   - Link to existing project or create new
   - Confirm settings
   - Deploy!

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your repository
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (or leave default)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### Step 3: Set Environment Variables

**CRITICAL:** Set these in Vercel Dashboard → Your Project → Settings → Environment Variables:

```
NEURALSEEK_API_KEY=1a3b54c5-d073da86-7114f775-a2a4a450
NEURALSEEK_AGENT=pehla_agent
```

**For Frontend (optional, for production):**
```
VITE_API_URL=/api/analyze
```

### Step 4: Redeploy

After setting environment variables, trigger a new deployment:
- Go to Deployments tab
- Click "..." on latest deployment
- Select "Redeploy"

Or push a new commit to auto-deploy.

---

## 🌐 Alternative Deployment Options

### Netlify

1. **Install Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod --dir=dist
   ```

**Note:** For Netlify, you'll need to:
- Create a Netlify Function for the API proxy (similar to Vercel's serverless function)
- Or keep the backend proxy running separately

### GitHub Pages

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json:**
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

**Note:** GitHub Pages doesn't support serverless functions. You'll need to:
- Use the backend proxy on a separate service (Railway, Render, etc.)
- Update `VITE_API_URL` to point to your backend

### Railway / Render (For Backend Proxy)

If you want to deploy the backend proxy separately:

1. **Railway:**
   - Connect your GitHub repo
   - Select `backend` folder
   - Set environment variables
   - Deploy

2. **Render:**
   - Create new Web Service
   - Point to `backend` folder
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Add environment variables

---

## ✅ Pre-Deployment Checklist

- [ ] All environment variables set in hosting platform
- [ ] Backend proxy running (if not using Vercel serverless)
- [ ] `VITE_API_URL` points to correct endpoint
- [ ] Test the deployed app
- [ ] Check browser console for errors
- [ ] Verify API calls work (check Network tab)

---

## 🔧 Troubleshooting

### API calls failing?
- Check environment variables are set correctly
- Verify `VITE_API_URL` matches your deployment
- Check browser console for CORS errors
- Ensure backend/serverless function is running

### Build errors?
- Run `npm run build` locally first to catch errors
- Check Node.js version (should be 18+)
- Ensure all dependencies are in `package.json`

### Environment variables not working?
- Vercel: Make sure to redeploy after adding variables
- Variables starting with `VITE_` are for frontend
- Variables without `VITE_` are for serverless functions

---

## 📝 Quick Reference

**Vercel Deployment:**
```bash
npm i -g vercel
vercel login
vercel
```

**Environment Variables Needed:**
- `NEURALSEEK_API_KEY` (for serverless function)
- `NEURALSEEK_AGENT` (for serverless function)
- `VITE_API_URL` (optional, defaults to `/api/analyze`)

**Your app will be live at:**
- `https://your-project.vercel.app`

---

## 🎉 That's It!

Once deployed, share your live URL and test all features:
- Landing page navigation
- Call recording
- Transcript editing
- Smart Insights
- Email generation

