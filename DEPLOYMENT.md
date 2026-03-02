# DEPLOYMENT GUIDE - MiniGitHub

Complete step-by-step guide to deploy MiniGitHub to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Render)](#backend-deployment-render)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Alternative Deployments](#alternative-deployments)
5. [Post-Deployment Setup](#post-deployment-setup)
6. [Common Issues](#common-issues)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ GitHub account
- ✅ Vercel account (for frontend)
- ✅ Render account (for backend)
- ✅ Supabase account with project
- ✅ Repository pushed to GitHub

---

## Backend Deployment (Render)

### Step 1: Prepare Backend

1. Ensure all code is pushed to GitHub:
```bash
cd backend
git add .
git commit -m "Backend ready for deployment"
git push origin main
```

2. Update backend `.env` variables (don't commit):
```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=use_a_strong_random_key_here
```

### Step 2: Create Render Web Service

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Fill in details:
   - **Name**: `minigithub-api`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Paid for production)

### Step 3: Add Environment Variables

In Render dashboard, go to Environment:

```
PORT=5000
NODE_ENV=production
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=https://your-frontend-url.vercel.app
MAX_FILE_SIZE=5242880
```

### Step 4: Deploy

Click "Deploy" button. Render will:
- Build the project
- Install dependencies
- Start the server

Once deployed, you'll get a URL like: `https://minigithub-api.onrender.com`

**Save this URL** - you'll need it for frontend.

### Troubleshooting Render

- **Build fails**: Check build logs, ensure Node 18+
- **Port error**: Render assigns PORT automatically, should be in .env
- **Memory error**: Upgrade to paid plan or optimize code

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. Push frontend to GitHub:
```bash
cd frontend
git add .
git commit -m "Frontend ready for deployment"
git push origin main
```

2. Note your backend URL from Render (e.g., `https://minigithub-api.onrender.com`)

### Step 2: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import GitHub repository
4. Select `frontend` folder in "Root Directory" (if monorepo)
5. Framework: Auto-detect should find Vite

### Step 3: Configure Build Settings

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 4: Add Environment Variables

In Vercel project Settings → Environment Variables:

```
VITE_API_URL=https://minigithub-api.onrender.com
VITE_API_BASE_PATH=/api
```

### Step 5: Deploy

Click "Deploy". Vercel will:
- Clone repository
- Install dependencies
- Build (npm run build)
- Deploy to CDN

You'll get a URL like: `https://minigithub.vercel.app`

### Troubleshooting Vercel

- **Build fails**: Check build logs
- **VITE variables not loading**: Restart deployment
- **404 on refresh**: Need `_vercel.json` or Vercel rewrites (should be automatic)

---

## Alternative Deployments

### Railway (Backend Alternative)

1. Go to [railway.app](https://railway.app)
2. Create new project → "Deploy from GitHub"
3. Select backend folder
4. Add environment variables
5. Deploy

### Netlify (Frontend Alternative)

```bash
cd frontend
npm run build
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

Or:
1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Add environment variables
7. Deploy

---

## Post-Deployment Setup

### 1. Update Frontend URL in Backend

If you want to change `FRONTEND_URL` after frontend deployment:

**On Render:**
1. Go to project settings
2. Update environment variable `FRONTEND_URL`
3. Redeploy or just restart

### 2. Test Deployment

1. Open frontend URL: `https://minigithub.vercel.app`
2. Try to sign up with a test account
3. Create files and folders
4. Edit and save files
5. Test logout and login

### 3. Monitor Logs

**Backend (Render):**
```bash
# In Render dashboard → Logs tab
# Watch for errors
```

**Frontend (Vercel):**
```bash
# In Vercel dashboard → Deployments → Logs
# Check build and runtime logs
```

### 4. Set Up Error Monitoring (Optional)

Add error tracking:
- [Sentry](https://sentry.io) for backend errors
- [LogRocket](https://logrocket.com) for frontend errors

---

## Production Checklist

### Backend
- [ ] NODE_ENV=production
- [ ] JWT_SECRET is strong and unique
- [ ] FRONTEND_URL is correct
- [ ] Database backups enabled
- [ ] Rate limiting configured
- [ ] Error logging setup
- [ ] HTTPS enforced
- [ ] CORS properly configured

### Frontend
- [ ] VITE_API_URL points to production backend
- [ ] Remove any console.log() statements
- [ ] Build runs without errors
- [ ] Tested in production
- [ ] Performance optimized
- [ ] Analytics setup (optional)

### Supabase
- [ ] Row Level Security (RLS) enabled on tables
- [ ] Storage bucket is private
- [ ] Backups scheduled
- [ ] Usage monitored
- [ ] Rate limits set (if needed)

---

## Performance Optimization

### Backend
```javascript
// Enable compression (add to server.js)
import compression from 'compression';
app.use(compression());
```

### Frontend
- Images optimized
- Code splitting enabled (Vite does this)
- Minimize bundle size
- Use CSS critical path

---

## Scaling

### Vertical Scaling (Single Server)
- Upgrade Render/Railway plan
- Increase memory/CPU

### Horizontal Scaling
- Use load balancer
- Multiple backend instances
- Database replication
- CDN for static assets

---

## Security Hardening

### Backend
```javascript
// Add helmet for security headers
import helmet from 'helmet';
app.use(helmet());

// Add rate limiting
```

### Frontend
- Enable HTTPS (automatic with Vercel/Render)
- Set security headers
- Content Security Policy

### General
- Never commit .env files
- Use strong, unique JWT secrets
- Enable 2FA on all platforms
- Rotate secrets periodically
- Monitor for suspicious activity

---

## Continuous Deployment

Both Vercel and Render support automatic deployments:

Whenever you push to GitHub:
1. Automatic build triggered
2. Tests run (if configured)
3. Automatic deployment
4. No downtime

Configure in platform settings.

---

## Cost Estimation

### Free Tier (Good for MVP)
- **Vercel** (Frontend): Free ($0/month)
- **Render** (Backend): Free with limitations
- **Supabase** (Database): Free tier ($0/month)
- **Total**: ~$0/month

### Production Tier
- **Vercel** (Frontend): Pro ($20/month) or pay-as-you-go
- **Render** (Backend): Standard ($7/month+)
- **Supabase** (Database): Pro ($25/month+)
- **Total**: ~$50-100+/month depending on usage

---

## Custom Domain

### Set Custom Domain

1. **Frontend (Vercel):**
   - Go to Project Settings → Domains
   - Add your domain
   - Follow DNS instructions

2. **Backend (Render):**
   - Go to Environment → Custom Domains
   - Add your domain
   - Update DNS

### Update After Custom Domain

1. Update frontend `.env`:
```env
VITE_API_URL=https://api.yourdomain.com
```

2. Update backend environment variable:
```env
FRONTEND_URL=https://www.yourdomain.com
```

3. Redeploy both

---

## Troubleshooting

### Frontend shows 401 Unauthorized
- Check backend URL in environment variables
- Verify backend is running
- Check CORS configuration

### Files not saving
- Check Supabase Storage bucket exists
- Verify file size limit
- Check backend logs

### Database errors
- Verify Supabase credentials
- Check table structure
- Monitor Supabase dashboard

### Performance issues
- Check free tier limits
- Consider upgrading
- Optimize database queries
- Enable caching

---

## Support & Monitoring

### Useful Commands

```bash
# Check backend is running
curl https://minigithub-api.onrender.com/health

# Monitor logs (Render)
# Dashboard → Logs tab

# Check deployment status (Vercel)
# Dashboard → Deployments
```

### Monitoring Tools

- [Uptime Robot](https://uptimerobot.com) - Monitor uptime
- [Sentry](https://sentry.io) - Error tracking
- [New Relic](https://newrelic.com) - Performance monitoring

---

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Vercel
3. ✅ Test all features
4. ✅ Set up monitoring
5. ✅ Add custom domain
6. ✅ Keep dependencies updated
7. ✅ Monitor logs regularly

**Congratulations! 🎉 Your MiniGitHub is now live in production!**

For support: Check logs, GitHub issues, or documentation.
