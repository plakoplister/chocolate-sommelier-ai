# 🚀 GitHub Setup Instructions

## Create Repository on GitHub

1. **Go to GitHub.com** and log in to your account
2. **Click the "+" icon** in the top right corner
3. **Select "New repository"**
4. **Fill in the details:**
   - Repository name: `chocolate-sommelier-ai`
   - Description: `AI-powered chocolate recommendation system based on taste profiling`
   - Make it **Public** (or Private if you prefer)
   - DON'T initialize with README (we already have one)
   - DON'T add .gitignore (we already have one)

5. **Click "Create repository"**

## Connect Local Repository to GitHub

After creating the repository on GitHub, run these commands in your terminal:

```bash
# Navigate to project directory
cd /Users/julienmarboeuf/Documents/XOCOA

# Add GitHub as remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/chocolate-sommelier-ai.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Alternative: Using GitHub CLI

If you want to use GitHub CLI, first install it:

```bash
# Install GitHub CLI on macOS
brew install gh

# Authenticate with GitHub
gh auth login

# Create repository and push
gh repo create chocolate-sommelier-ai --public --source=. --remote=origin --push
```

## Repository URL

Once created, your repository will be available at:
`https://github.com/YOUR_USERNAME/chocolate-sommelier-ai`

## Next Steps

After pushing to GitHub, you can:
1. Share the repository URL with others
2. Deploy the web app using services like:
   - Heroku
   - Railway
   - Render
   - PythonAnywhere
   - Google Cloud Run
   - AWS Elastic Beanstalk

## Deployment Ready Files

The repository includes everything needed for deployment:
- `web_app.py` - Flask application
- `templates/` - HTML templates
- `requirements.txt` - Python dependencies (to be created)
- `.gitignore` - Ignore unnecessary files
- `README.md` - Documentation