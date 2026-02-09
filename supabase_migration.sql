-- ============================================================
-- COMMUNITY FEATURE - Supabase Migration
-- ============================================================
-- Run this SQL in Supabase SQL Editor to create the required tables.
-- ============================================================

-- 1. community_topics: One topic per day
CREATE TABLE community_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  question text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. community_comments: Flat comments on topics
CREATE TABLE community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES community_topics(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_deleted boolean DEFAULT false
);

-- 3. community_reports: Optional reporting
CREATE TABLE community_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid REFERENCES community_comments(id) ON DELETE CASCADE NOT NULL,
  reporter_user_id uuid NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX idx_community_topics_date ON community_topics(date);
CREATE INDEX idx_community_comments_topic ON community_comments(topic_id);
CREATE INDEX idx_community_comments_user ON community_comments(user_id);
CREATE INDEX idx_community_reports_comment ON community_reports(comment_id);

-- ============================================================
-- Row Level Security (optional but recommended)
-- ============================================================
-- Note: Since we use service role key on backend, RLS is bypassed.
-- These policies are for if you ever access directly from frontend.

ALTER TABLE community_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;

-- Topics: Anyone authenticated can read
CREATE POLICY "Topics are viewable by authenticated users" ON community_topics
  FOR SELECT TO authenticated USING (true);

-- Comments: Anyone authenticated can read non-deleted, users can insert
CREATE POLICY "Comments are viewable by authenticated users" ON community_comments
  FOR SELECT TO authenticated USING (is_deleted = false);

CREATE POLICY "Users can insert their own comments" ON community_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON community_comments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Reports: Users can insert their own reports
CREATE POLICY "Users can insert reports" ON community_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_user_id);
