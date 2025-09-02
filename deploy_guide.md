# 🚀 Deployment Guide - Chocolate Sommelier AI

## Quick Deployment Options

### Option 1: Render (Recommended - FREE)

1. **Create account at [render.com](https://render.com)**

2. **Connect your GitHub repository**

3. **Create New Web Service:**
   - Name: `chocolate-sommelier`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn web_app_en:app`
   - Plan: **Free**

4. **Your app will be live at:** `https://chocolate-sommelier.onrender.com`

### Option 2: Railway

1. **Go to [railway.app](https://railway.app)**

2. **Click "Deploy from GitHub"**

3. **Select your repository**

4. **Railway will auto-detect Flask and deploy**

5. **Get your URL:** `https://chocolate-sommelier.up.railway.app`

### Option 3: Heroku

Create `Procfile` in root directory:
```
web: gunicorn web_app_en:app
```

Deploy:
```bash
heroku create chocolate-sommelier
git push heroku main
```

### Option 4: Vercel (for static export)

Create `vercel.json`:
```json
{
  "builds": [
    {
      "src": "web_app_en.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "web_app_en.py"
    }
  ]
}
```

### Option 5: PythonAnywhere (FREE)

1. **Sign up at [pythonanywhere.com](https://www.pythonanywhere.com)**

2. **Upload your files**

3. **Create web app:**
   - Python version: 3.9
   - Framework: Flask
   - Source code: `/home/yourusername/chocolate-sommelier`

4. **Edit WSGI configuration:**
```python
import sys
sys.path.append('/home/yourusername/chocolate-sommelier')
from web_app_en import app as application
```

5. **Your app:** `https://yourusername.pythonanywhere.com`

## Environment Variables

For production, create `.env` file:
```
FLASK_ENV=production
SECRET_KEY=your-secret-key-here
```

## Custom Domain

Most platforms support custom domains:
- Render: Settings → Custom Domains
- Railway: Settings → Domains
- Heroku: Settings → Domains

## Share Your App

Once deployed, share your URL:
- Social Media
- QR Code
- Email signature
- Business cards

## Monitoring

- Use platform analytics
- Add Google Analytics
- Monitor with UptimeRobot

## Updates

To update your deployed app:
```bash
git add .
git commit -m "Update message"
git push origin main
```

Most platforms auto-deploy from GitHub!