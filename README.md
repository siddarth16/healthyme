# CalorieCoach

A modern web application for tracking nutrition, logging meals with natural language, and receiving personalized coaching powered by AI.

## Features

- 🔐 **Google OAuth Authentication** - Secure, one-click sign-in
- 🎯 **Personalized Calorie & Macro Targets** - Based on your goals using Mifflin-St Jeor equation
- 💬 **Natural Language Meal Logging** - Just type what you ate, AI handles the rest
- 📊 **Progress Tracking** - Beautiful visualizations of your daily nutrition
- 📅 **History View** - Review your nutrition over custom date ranges
- 🤖 **AI Nutrition Coach** - Get personalized advice grounded in your data
- 🌓 **Dark Mode** - Comfortable viewing in any lighting
- 📱 **Mobile-First Design** - Works perfectly on phones, tablets, and desktop
- 🔒 **Privacy-Focused** - Export your data or delete your account anytime

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Google OAuth)
- **AI**: Google Gemini 2.5 Flash
- **Hosting**: Vercel

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- A Google Gemini API key (free tier available)
- A Vercel account for deployment (optional, free tier works)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd healthyme
npm install
```

### 2. Set Up Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the database to initialize
3. Go to the SQL Editor in your Supabase dashboard
4. Run the database schema from `DATABASE_SCHEMA.md` (copy and paste the SQL commands)
5. Go to Authentication > Providers
6. Enable Google OAuth provider
7. Add your Google OAuth credentials:
   - Get credentials from [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or use existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase

### 3. Get Gemini API Key

1. Go to [https://ai.google.dev](https://ai.google.dev)
2. Click "Get API Key"
3. Create a new API key for your project
4. Copy the API key

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your credentials in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   GEMINI_API_KEY=your-gemini-api-key
   ```

3. Get your Supabase URL and anon key from:
   - Project Settings > API in your Supabase dashboard

### 5. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app!

## Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
npm install -g vercel
vercel
# Follow the prompts
# Add environment variables when prompted
```

### Important: Update Supabase Redirect URLs

After deploying, update your Supabase Google OAuth redirect URL:
1. Go to Authentication > Providers > Google
2. Update the redirect URL to include your Vercel domain:
   - `https://your-app.vercel.app/api/auth/callback`

## Database Schema

The database schema is fully documented in `DATABASE_SCHEMA.md`. Key tables:

- `profiles` - User profiles with goals and calculated targets
- `meal_entries` - Logged meals with parsed nutrition data
- `coaching_messages` - Chat history with the AI coach

All tables use Row Level Security (RLS) to ensure users can only access their own data.

## Features Walkthrough

### Onboarding
1. Sign in with Google
2. Enter your metrics (weight, height, age, sex)
3. Set your target weight and date
4. Get personalized calorie and macro targets

### Meal Logging
1. Type meals in natural language: "2 rotis and dal at lunch"
2. AI parses and estimates nutrition
3. Review and edit before saving
4. Meals are saved to your daily log

### Progress Tracking
- **Today View**: See current progress vs targets
- **History View**: Review past days with date range selector
- **Coach**: Ask questions about your progress

### Data Management
- Export all your data as JSON
- Delete your account and all data permanently

## Development

### Project Structure

```
healthyme/
├── app/                     # Next.js app directory
│   ├── api/                 # API routes
│   ├── dashboard/           # Dashboard page
│   ├── login/               # Login page
│   ├── onboarding/          # Onboarding flow
│   └── profile/             # Profile settings
├── components/              # React components
│   ├── coaching/            # Coaching chat
│   ├── dashboard/           # Dashboard views
│   ├── layout/              # Layout components
│   ├── meals/               # Meal logging
│   ├── onboarding/          # Onboarding form
│   ├── profile/             # Profile settings
│   └── ui/                  # Reusable UI components
├── lib/                     # Libraries
│   ├── gemini/              # Gemini AI integration
│   └── supabase/            # Supabase clients
├── types/                   # TypeScript types
├── utils/                   # Utility functions
└── DATABASE_SCHEMA.md       # Database documentation
```

### Key Files

- `middleware.ts` - Handles Supabase session refresh
- `utils/calorie-calculator.ts` - BMR/TDEE calculations
- `lib/gemini/client.ts` - AI meal parsing and coaching
- `types/index.ts` - TypeScript type definitions

## Troubleshooting

### "Failed to parse meal"
- Check that your Gemini API key is valid
- Ensure the API key has sufficient quota
- Try simplifying your meal description

### "Unauthorized" errors
- Clear browser cookies and sign in again
- Check Supabase Google OAuth configuration
- Verify redirect URLs match exactly

### Dark mode not persisting
- Check that localStorage is enabled in your browser
- Clear cache and reload

## Contributing

This is a personal project, but suggestions and bug reports are welcome!

## License

MIT License - feel free to use this project for learning or personal use.

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Supabase, and Google Gemini
