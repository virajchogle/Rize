# Quick Setup Guide

## Installation Steps

1. **Navigate to the project directory:**
   ```bash
   cd call-transcription-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - The `.env` file should already be created with the API credentials
   - If not, copy `.env.example` to `.env` and add your credentials

4. **Set up the backend proxy (REQUIRED):**
   ```bash
   cd backend
   npm install
   npm start
   ```
   - The backend will run on `http://localhost:3001`
   - Keep this terminal open

5. **Start the frontend development server:**
   - Open a **new terminal** window
   ```bash
   npm run dev
   ```
   - The app will be available at `http://localhost:5173` (or the port shown in terminal)
   - **Important:** Use Chrome or Edge for best speech recognition support

6. **You should now have two servers running:**
   - Backend proxy: `http://localhost:3001`
   - Frontend app: `http://localhost:5173`

## Features

✅ **Dual Audio Recording** - Records microphone + system audio  
✅ **Real-time Transcription** - Live speech-to-text using AssemblyAI (transcribes both sides of the call)  
✅ **AI Analysis** - NeuralSeek AI analyzes the transcript  
✅ **Auto Email Generation** - Creates follow-up emails automatically  

## Browser Requirements

- **Chrome/Edge:** Full support (recommended)
- **Firefox:** Limited support
- **Safari:** Limited speech recognition

## Troubleshooting

### Microphone not working?
- Check browser permissions
- Use HTTPS in production (required for microphone access)
- Try a different browser

### Speech recognition not working?
- Use Chrome or Edge browser
- Check that microphone permissions are granted
- Ensure you're on HTTPS (or localhost)

### API errors?
- **Make sure the backend proxy is running** on port 3001
- Verify your API keys in `backend/.env` file:
  - `NEURALSEEK_API_KEY` - For AI analysis
  - `ASSEMBLYAI_API_KEY` - For real-time transcription (get one free at https://www.assemblyai.com/)
- Check that the API endpoint URL is correct
- Ensure network connectivity
- Check browser console for CORS errors (if backend isn't running)

## Build for Production

```bash
npm run build
```

The `dist` folder will contain the production build ready for deployment.

