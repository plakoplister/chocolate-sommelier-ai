# 🚀 Deploy to Netlify - Chocolate Sommelier AI

## Quick Deploy (2 minutes!) 

### Method 1: Drag & Drop (Easiest)

1. **Compress your project** (excluding `.git` folder):
   ```bash
   zip -r chocolate-sommelier.zip . -x ".git/*" "node_modules/*"
   ```

2. **Go to [netlify.com](https://netlify.com) and sign up**

3. **Drag & drop** the zip file to Netlify dashboard

4. **Your site is live!** 🎉 
   - URL: `https://random-name.netlify.app`
   - Can be customized later

### Method 2: Git Integration (Recommended for updates)

1. **Push to GitHub first** (if not done):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/chocolate-sommelier-ai.git
   git branch -M main
   git push -u origin main
   ```

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Choose GitHub
   - Select your repository
   - Build settings are auto-detected from `netlify.toml`

3. **Deploy automatically!**
   - Every GitHub push will auto-deploy
   - Get your URL: `https://your-site.netlify.app`

## Custom Domain (Optional)

1. **In Netlify Dashboard:**
   - Site Settings → Domain Management
   - Add custom domain
   - Follow DNS instructions

2. **Free SSL included!** 🔒

## Environment Variables

If you add API keys later:
- Site Settings → Environment Variables
- Add your variables

## Features Included

✅ **Serverless Functions** (/.netlify/functions/)
✅ **Form Handling** (future contact forms)
✅ **CDN & Caching** (lightning fast)
✅ **HTTPS** (automatic SSL)
✅ **Custom Domains** (free)
✅ **Deploy Previews** (test changes)

## File Structure for Netlify

```
├── index.html              # Main page
├── netlify.toml            # Configuration
├── netlify/
│   └── functions/
│       ├── chocolates.js   # Get chocolates
│       └── recommend.js    # Recommendations
├── chocolate_sommelier_agent_en.py
├── requirements.txt
└── README.md
```

## Testing Locally with Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Test functions locally
netlify dev

# Deploy
netlify deploy --prod
```

## URL Examples

- **Auto-generated**: `https://amazing-chocolate-sommelier-123.netlify.app`
- **Custom**: `https://chocolate-sommelier.your-domain.com`
- **Subdomain**: `https://chocolatesommelier.netlify.app`

## Sharing Your App

Once deployed, share your Netlify URL:
- 📱 **Mobile-friendly** (responsive design)
- 🌐 **Global CDN** (fast worldwide)
- 📊 **Analytics** (built-in)
- 🔗 **QR Code** (generate from URL)

## Updates

Any changes pushed to GitHub will auto-deploy!

```bash
git add .
git commit -m "Update recommendations"
git push
# Automatically deploys to Netlify!
```

## Free Tier Limits

- ✅ **100GB bandwidth/month**
- ✅ **300 build minutes/month** 
- ✅ **Unlimited sites**
- ✅ **Forms: 100 submissions/month**
- ✅ **Functions: 125,000 requests/month**

Perfect for this chocolate sommelier project! 🍫

## Support

- [Netlify Docs](https://docs.netlify.com)
- [Netlify Community](https://community.netlify.com)
- [Contact Support](https://netlify.com/support)