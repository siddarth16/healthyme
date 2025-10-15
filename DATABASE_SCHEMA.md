# CalorieCoach Database Schema

This document describes the Supabase PostgreSQL schema for CalorieCoach.

## Tables

### 1. `profiles`
Stores user profile and goal information.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL,
  height_cm DECIMAL(5,2) NOT NULL,
  age INTEGER NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  activity_level TEXT NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  target_weight_kg DECIMAL(5,2) NOT NULL,
  target_date DATE NOT NULL,
  dietary_preference TEXT CHECK (dietary_preference IN ('none', 'vegetarian', 'eggetarian', 'vegan', 'pescatarian')),
  cuisine_bias TEXT CHECK (cuisine_bias IN ('indian', 'global', 'mixed')),
  timezone TEXT DEFAULT 'UTC',
  daily_calorie_target INTEGER NOT NULL,
  protein_target_g INTEGER NOT NULL,
  fat_target_g INTEGER NOT NULL,
  carbs_target_g INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = id);

-- Index for faster lookups
CREATE INDEX idx_profiles_user_id ON profiles(id);
```

### 2. `meal_entries`
Stores individual meal log entries with parsed items.

```sql
CREATE TABLE meal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  original_text TEXT NOT NULL,
  items JSONB NOT NULL, -- Array of ParsedMealItem objects
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE meal_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own meal entries
CREATE POLICY "Users can view own meal entries"
  ON meal_entries FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own meal entries
CREATE POLICY "Users can insert own meal entries"
  ON meal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own meal entries
CREATE POLICY "Users can update own meal entries"
  ON meal_entries FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own meal entries
CREATE POLICY "Users can delete own meal entries"
  ON meal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for faster queries
CREATE INDEX idx_meal_entries_user_date ON meal_entries(user_id, date DESC);
CREATE INDEX idx_meal_entries_user_id ON meal_entries(user_id);
```

### 3. `coaching_messages`
Stores chat history for the coaching feature.

```sql
CREATE TABLE coaching_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE coaching_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own messages
CREATE POLICY "Users can view own coaching messages"
  ON coaching_messages FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own messages
CREATE POLICY "Users can insert own coaching messages"
  ON coaching_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own messages
CREATE POLICY "Users can delete own coaching messages"
  ON coaching_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_coaching_messages_user_created ON coaching_messages(user_id, created_at DESC);
```

## Functions

### Update `updated_at` timestamp automatically

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to profiles table
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to meal_entries table
CREATE TRIGGER update_meal_entries_updated_at
  BEFORE UPDATE ON meal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Setup Instructions

1. Create a new Supabase project at https://supabase.com
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste each table creation SQL above (in order)
4. Copy and paste the functions SQL
5. Enable Google OAuth:
   - Go to Authentication > Providers
   - Enable Google provider
   - Add your Google OAuth credentials
   - Set the redirect URL to: `https://your-project.supabase.co/auth/v1/callback`
6. Copy your project URL and anon key to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## Data Export/Delete

Users can request their data export or account deletion via the profile page. The implementation will:
- **Export**: Query all tables for the user's data and generate a JSON file
- **Delete**: CASCADE delete ensures all related data is removed when the profile is deleted
