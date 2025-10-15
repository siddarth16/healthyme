# CalorieCoach - Deployment Guide

This guide will walk you through deploying CalorieCoach to production.

## Pre-Deployment Checklist

Before deploying, ensure you have:
- ✅ A Supabase project created
- ✅ Database schema applied from DATABASE_SCHEMA.md
- ✅ Google OAuth configured in Supabase
- ✅ Gemini API key obtained
- ✅ Code pushed to GitHub

## Step-by-Step Deployment

### 1. Set Up Supabase

#### Create Project
1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose a name and strong database password
4. Wait for project initialization (~2 minutes)

#### Apply Database Schema
1. Go to SQL Editor in Supabase dashboard
2. Open `DATABASE_SCHEMA.md` in this repository
3. Copy the SQL for each table and function
4. Run them in order in the SQL Editor

#### Configure Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use existing)
3. Enable "Google+ API"
4. Go to "APIs & Services" > "Credentials"
5. Click "Create Credentials" > "OAuth 2.0 Client ID"
6. Application type: "Web application"
7. Add authorized redirect URI:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
8. Copy the Client ID and Client Secret
9. Go to Supabase > Authentication > Providers > Google
10. Enable Google provider and paste the credentials

#### Get Supabase Credentials
1. Go to Project Settings > API
2. Copy the following:
   - Project URL (e.g., `https://abcdefgh.supabase.co`)
   - Anon/public key (starts with `eyJ...`)

### 2. Get Gemini API Key

1. Go to [https://ai.google.dev](https://ai.google.dev)
2. Click "Get API Key" in Google AI Studio
3. Create an API key for your project
4. Copy the API key (starts with `AIza...`)

### 3. Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin master
   ```

2. **Connect to Vercel**
   - Go to [https://vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Click "Import"

3. **Configure Environment Variables**
   In the Vercel deployment settings, add these environment variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `https://your-app.vercel.app`

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts and add environment variables when asked
```

### 4. Update Supabase Redirect URLs

**IMPORTANT**: After deployment, you must update the Google OAuth redirect URL:

1. Go to your Supabase project > Authentication > Providers > Google
2. Add your Vercel URL to the redirect URLs:
   ```
   https://your-app.vercel.app/api/auth/callback
   ```
3. Also update in Google Cloud Console:
   - Go to your OAuth credentials
   - Add to Authorized redirect URIs:
     ```
     https://your-app.vercel.app/api/auth/callback
     ```

### 5. Test Your Deployment

1. Visit your Vercel URL
2. Try to log in with Google
3. Complete the onboarding flow
4. Log a test meal
5. Check that data persists

## Troubleshooting

### Build Failures

**Error: "Invalid supabaseUrl"**
- Make sure environment variables are set in Vercel
- Variables should NOT have quotes around them
- Check for typos in variable names

**Error: "Module not found"**
- Run `npm install` locally to ensure package.json is correct
- Commit package-lock.json to git
- Redeploy

### Runtime Issues

**Google OAuth not working**
- Check redirect URLs match exactly (including https://)
- Verify Google OAuth credentials are correct in Supabase
- Check browser console for specific errors

**"Unauthorized" errors**
- Verify Supabase environment variables are set correctly
- Check that RLS policies are applied (from DATABASE_SCHEMA.md)
- Try logging out and back in

**Gemini API errors**
- Verify API key is correct
- Check API key has quota remaining
- Ensure GEMINI_API_KEY environment variable is set

### Data Issues

**Profile not saving**
- Check Supabase SQL Editor logs for errors
- Verify all tables and RLS policies are created
- Check browser network tab for API errors

## Environment Variables Reference

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase > Project Settings > API |
| `GEMINI_API_KEY` | Google Gemini API key | Google AI Studio |

## Custom Domain (Optional)

To use a custom domain with Vercel:

1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow Vercel's DNS configuration instructions
5. Update Supabase and Google OAuth redirect URLs to use your custom domain

## Monitoring and Maintenance

### View Logs
- **Vercel Logs**: Vercel Dashboard > Your Project > Logs
- **Supabase Logs**: Supabase Dashboard > Logs

### Monitor Usage
- **Vercel**: Check bandwidth and function invocations
- **Supabase**: Monitor database size and API requests
- **Gemini**: Check API quota usage in Google Cloud Console

### Free Tier Limits
- **Vercel**: 100GB bandwidth, 100GB-hours compute
- **Supabase**: 500MB database, 50MB file storage, 2GB bandwidth
- **Gemini**: 15 requests per minute (free tier)

## Updating the App

To deploy updates:

```bash
# Make your changes
git add .
git commit -m "Your update message"
git push origin master

# Vercel will automatically deploy the update
```

## Rolling Back

If something goes wrong:

1. Go to Vercel Dashboard > Your Project > Deployments
2. Find a previous working deployment
3. Click the three dots > "Promote to Production"

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Vercel and Supabase logs
3. Verify all environment variables are set correctly
4. Ensure database schema is fully applied

---

Good luck with your deployment! 🚀
