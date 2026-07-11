-- MeetWise Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- 1. CREATE PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team')),
    webhook_secret TEXT DEFAULT gen_random_uuid()::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CREATE ONBOARDINGS TABLE
-- ============================================
-- Rename existing table summaries to onboardings if it exists
ALTER TABLE IF EXISTS public.summaries RENAME TO onboardings;

CREATE TABLE IF NOT EXISTS public.onboardings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    notes TEXT,
    summary TEXT,
    key_points JSONB DEFAULT '[]'::jsonb,
    action_items JSONB DEFAULT '[]'::jsonb,
    health_audit JSONB DEFAULT '{}'::jsonb,
    dependency_graph TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_onboardings_user_id ON public.onboardings(user_id);
CREATE INDEX IF NOT EXISTS idx_onboardings_created_at ON public.onboardings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboardings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. CREATE RLS POLICIES FOR PROFILES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ============================================
-- 6. CREATE RLS POLICIES FOR ONBOARDINGS
-- ============================================

-- Users can view their own onboardings
CREATE POLICY "Users can view own onboardings"
    ON public.onboardings
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own onboardings
CREATE POLICY "Users can insert own onboardings"
    ON public.onboardings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own onboardings
CREATE POLICY "Users can update own onboardings"
    ON public.onboardings
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own onboardings
CREATE POLICY "Users can delete own onboardings"
    ON public.onboardings
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 7. CREATE FUNCTION TO UPDATE updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. CREATE TRIGGERS FOR updated_at
-- ============================================
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_onboardings_updated_at ON public.onboardings;
CREATE TRIGGER update_onboardings_updated_at
    BEFORE UPDATE ON public.onboardings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. CREATE SYNC_LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    onboarding_id UUID REFERENCES public.onboardings(id) ON DELETE CASCADE NOT NULL,
    event TEXT NOT NULL,
    branch TEXT NOT NULL DEFAULT 'main',
    commit_hash TEXT,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'syncing')),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_onboarding_id ON public.sync_logs(onboarding_id);

ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sync logs of own onboardings"
    ON public.sync_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.onboardings
            WHERE public.onboardings.id = public.sync_logs.onboarding_id
              AND public.onboardings.user_id = auth.uid()
        )
    );

-- ============================================
-- 9.5 CREATE CODE_REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.code_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    onboarding_id UUID REFERENCES public.onboardings(id) ON DELETE CASCADE NOT NULL,
    filename TEXT,
    code_snippet TEXT NOT NULL,
    review_feedback JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_code_reviews_onboarding_id ON public.code_reviews(onboarding_id);

ALTER TABLE public.code_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reviews of own onboardings"
    ON public.code_reviews
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.onboardings
            WHERE public.onboardings.id = public.code_reviews.onboarding_id
              AND public.onboardings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert reviews of own onboardings"
    ON public.code_reviews
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.onboardings
            WHERE public.onboardings.id = public.code_reviews.onboarding_id
              AND public.onboardings.user_id = auth.uid()
        )
    );

-- ============================================
-- 10. GRANT PERMISSIONS
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.onboardings TO authenticated;
GRANT ALL ON public.sync_logs TO authenticated;
GRANT ALL ON public.code_reviews TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.onboardings TO anon;
GRANT SELECT ON public.sync_logs TO anon;
GRANT SELECT ON public.code_reviews TO anon;
