# Rize

A clean, simple web application that records calls, transcribes speech to text in real-time, and analyzes transcripts using NeuralSeek AI to generate follow-up emails.

## Features

- 🎤 **Dual Audio Recording** - Records both microphone and system audio
- 📝 **Real-time Transcription** - Uses Web Speech API for live transcription
- 🤖 **AI Analysis** - Analyzes calls using NeuralSeek AI
- 📧 **Auto Email Generation** - Creates follow-up emails automatically

## Setup

### Frontend Setup

1. Install frontend dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# .env file should already be created
# If not, copy .env.example to .env and add your credentials
```

3. Run frontend development server:
```bash
npm run dev
```

### Backend Proxy Setup (Required for API calls)

The backend proxy is needed to avoid CORS issues when calling the NeuralSeek API.

1. Navigate to backend directory:
```bash
cd backend
```

2. Install backend dependencies:
```bash
npm install
```

3. Start the backend proxy server:
```bash
npm start
```

The backend will run on `http://localhost:3001`

### Running Both Servers

You need to run both servers simultaneously:

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

### Vercel (Recommended)

Vercel automatically handles the serverless function in `/api/analyze.js`.

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Build the project:
```bash
npm run build
```

3. Deploy:
```bash
vercel
```

4. **Set environment variables in Vercel dashboard:**
   - `NEURALSEEK_API_KEY` - Your API key
   - `NEURALSEEK_AGENT` - Agent name (default: `pehla_agent`)

5. Update frontend `.env` for production:
   - Set `VITE_API_URL=/api/analyze` (or leave unset to use default)

The serverless function will handle API calls without needing a separate backend server.

### Netlify

For Netlify, you'll need to use a different approach (Netlify Functions) or keep the backend proxy running separately.

```bash
npm run build
# Deploy dist folder to Netlify
```

## Browser Support

- Chrome/Edge: Full support (recommended)
- Firefox: Limited support
- Safari: Limited speech recognition support

## Environment Variables

### Frontend (.env)
- `VITE_API_URL` - Backend proxy URL (default: `http://localhost:3001/api/analyze`)
- `VITE_NEURALSEEK_API_URL` - NeuralSeek API endpoint (legacy, not used with proxy)
- `VITE_NEURALSEEK_API_KEY` - Your API key (legacy, not used with proxy)
- `VITE_NEURALSEEK_AGENT` - Agent name (legacy, not used with proxy)

### Backend (backend/.env)
- `NEURALSEEK_API_URL` - NeuralSeek API endpoint
- `NEURALSEEK_API_KEY` - Your API key
- `NEURALSEEK_AGENT` - Agent name
- `PORT` - Backend server port (default: 3001)

