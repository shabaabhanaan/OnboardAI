# Database Setup Guide for Supabase

## Quick Setup Instructions

Follow these steps to create the required database tables in your Supabase project.

### Step 1: Open Supabase SQL Editor

1. Go to https://app.supabase.com
2. Select your MeetWise project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Schema SQL

1. Open the file: [supabase/schema.sql](file:///c:/Users/Win10/OneDrive/MERN-Ecommerce-main/MeetWise---AI-Smart-Meeting-Notes-Generator/supabase/schema.sql)
2. Copy the entire SQL content
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify Tables Created

After running the SQL, verify the tables were created:

1. Click **Table Editor** in the left sidebar
2. You should see two tables:
   - ✅ **profiles** - Stores user profile information
   - ✅ **meetings** - Stores meeting notes and AI summaries

### What This Creates

**Tables:**
- `profiles` - User profiles with username, email, and plan
- `meetings` - Meeting notes with title, notes, summary, key_points, action_items

**Security:**
- Row Level Security (RLS) enabled on both tables
- Users can only access their own data
- Automatic user_id validation

**Features:**
- Automatic timestamps (created_at, updated_at)
- Indexes for fast queries
- Foreign key relationships
- JSON storage for key_points and action_items

### Step 4: Test the Application

After creating the tables:

1. Go to http://localhost:3000/dashboard
2. Click **New Meeting**
3. Create a test meeting
4. Verify it appears in your meetings list

### Troubleshooting

**If you get "permission denied" errors:**
- Make sure you're logged in to Supabase
- Verify RLS policies were created correctly
- Check that you're using the correct Supabase project

**If tables already exist:**
- The SQL uses `IF NOT EXISTS` so it's safe to run multiple times
- If you need to reset, you can drop tables first:
  ```sql
  DROP TABLE IF EXISTS public.meetings CASCADE;
  DROP TABLE IF EXISTS public.profiles CASCADE;
  ```

**To view existing data:**
1. Go to **Table Editor** in Supabase
2. Click on **meetings** or **profiles**
3. View and edit data directly

### Schema Details

**profiles table:**
```
id          UUID (primary key, references auth.users)
username    TEXT (unique)
email       TEXT (unique)
plan        TEXT (free/pro/team)
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

**meetings table:**
```
id           UUID (primary key)
user_id      UUID (foreign key to profiles)
title        TEXT
notes        TEXT
summary      TEXT
key_points   JSONB (array)
action_items JSONB (array)
created_at   TIMESTAMP
updated_at   TIMESTAMP
```

### Next Steps

1. ✅ Run the schema SQL in Supabase
2. ✅ Verify tables are created
3. ✅ Test creating a meeting
4. ✅ Check that data is saved correctly
