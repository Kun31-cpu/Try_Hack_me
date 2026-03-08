# Deployment Guide for HackLab

This application is a full-stack Express + Vite app with Socket.io for real-time features.

## Recommended Platforms
Because this app uses **WebSockets (Socket.io)**, it requires a platform that supports long-running processes.

### 1. Render / Railway / Fly.io (Recommended)
These platforms support the `Procfile` and will run the app exactly as it is here, including WebSockets.
- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Environment Variables:** See `.env.example`

### 2. Vercel
Vercel is great for the frontend, but has limitations for this specific backend:
- **WebSockets:** Socket.io will **not** work on Vercel because it uses serverless functions.
- **Configuration:** I have added `vercel.json` for you.
- **Setup:** Connect your GitHub repo to Vercel and it should detect the settings.

### 3. Netlify
Similar to Vercel, Netlify is primarily for static sites.
- **WebSockets:** Will **not** work.
- **Configuration:** I have added `netlify.toml`.

## Environment Variables
Make sure to set these in your deployment dashboard:
- `GEMINI_API_KEY`: Your Google Gemini API Key.
- `NODE_ENV`: Set to `production`.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: If using OAuth.

## Database
Currently, the app uses an in-memory store (or SQLite if configured). For production, you should connect to a persistent database like PostgreSQL or MongoDB if you want to save data permanently.
