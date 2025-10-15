# CalorieCoach - Quick Start Guide

Get CalorieCoach running in under 15 minutes!

## Prerequisites
- Node.js 18+ installed
- npm installed
- GitHub account
- Google account

## Step 1: Set Up Supabase (5 min)

1. Go to [supabase.com](https://supabase.com) → Sign in → "New Project"
2. Name: `caloriecoach` | Password: (choose strong password) | Region: (closest to you)
3. Wait ~2 minutes for initialization
4. Go to **SQL Editor** → Click "+ New Query"
5. Open `DATABASE_SCHEMA.md` in this repo → Copy all SQL → Paste → Run
6. Verify tables created: Go to **Table Editor** → You should see `profiles`, `meal_entries`, `coaching_messages`

## Step 2: Configure Google OAuth (5 min)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project or select existing
3. Search "Google+ API" → Enable it
4. Go to "APIs & Services" → "Credentials" → "+ Create Credentials" → "OAuth 2.0 Client ID"
5. Configure consent screen if prompted (External, add your email)
6. Application type: **Web application**
7. Name: `CalorieCoach`
8. Authorized redirect URIs → Add:
   ```
   https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
   ```
   (Get YOUR-PROJECT-REF from Supabase Settings → API → Project URL)
9. Click **Create** → Copy Client ID and Client Secret
10. Go to Supabase → **Authentication** → **Providers** → **Google**
11. Enable → Paste Client ID and Secret → Save

## Step 3: Get Gemini API Key (2 min)

1. Go to [ai.google.dev](https://ai.google.dev)
2. Click "Get API key in Google AI Studio"
3. Click "Create API Key" → Select project → Copy key

## Step 4: Configure Locally (2 min)

1. Open terminal in project folder:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your values:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...your-anon-key
   GEMINI_API_KEY=AIza...your-gemini-key
   ```

3. Get Supabase values from: Supabase → Settings → API
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 5: Run Locally (1 min)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → Click "Continue with Google" → Test!

## Step 6: Deploy to Vercel (5 min)

1. **Initialize Git & Push**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M master
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin master
   ```

2. **Deploy**:
   - Go to [vercel.com](https://vercel.com) → "Add New Project"
   - Import your GitHub repo → Click "Import"
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `GEMINI_API_KEY`
   - Click "Deploy"

3. **Update OAuth URLs** (IMPORTANT!):
   - Copy your Vercel URL (e.g., `https://your-app.vercel.app`)
   - Supabase → Authentication → Providers → Google → Add redirect URL:
     ```
     https://your-app.vercel.app/api/auth/callback
     ```
   - Google Cloud Console → Your OAuth Client → Add to Authorized redirect URIs:
     ```
     https://your-app.vercel.app/api/auth/callback
     ```

## Done! 🎉

Visit your Vercel URL and start tracking!

## Troubleshooting

**"Invalid supabaseUrl" during build**
- This is okay locally if .env.local isn't set
- On Vercel, make sure environment variables are added

**Google OAuth not working**
- Check redirect URLs match exactly (http vs https matters!)
- Make sure you updated BOTH Supabase AND Google Cloud Console

**Database errors**
- Verify all SQL from DATABASE_SCHEMA.md was run
- Check Supabase → SQL Editor → Logs for errors

**Meal parsing fails**
- Check Gemini API key is valid
- Verify quota hasn't been exceeded (check Google Cloud Console)

## What to Test

1. ✅ Sign in with Google
2. ✅ Complete onboarding (enter weight, height, etc.)
3. ✅ Log a meal: "2 eggs and toast for breakfast"
4. ✅ Edit the parsed meal before saving
5. ✅ Check Today view shows your meal
6. ✅ Go to History → Change date range
7. ✅ Go to Coach → Ask "Am I on track?"
8. ✅ Toggle dark/light mode
9. ✅ Go to Profile → Export data
10. ✅ Test on mobile phone

## Need Help?

- Check `README.md` for detailed setup
- See `DEPLOYMENT.md` for deployment details
- Review `PROJECT_SUMMARY.md` for architecture

---

Happy tracking! 💪
