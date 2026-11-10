# Community safety database setup

Run this migration in the Supabase SQL Editor before deploying the community moderation code. It adds approval states for posts and comments, a report queue, and per-user blocking. Existing posts and comments remain approved.

```sql
-- Only approved community content is visible to ordinary app users.
ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'approved';

ALTER TABLE community_comments
  ADD COLUMN IF NOT EXISTS moderation_status TEXT NOT NULL DEFAULT 'approved';

ALTER TABLE community_posts
  DROP CONSTRAINT IF EXISTS community_posts_moderation_status_check;
ALTER TABLE community_posts
  ADD CONSTRAINT community_posts_moderation_status_check
  CHECK (moderation_status IN ('pending_review', 'approved', 'rejected'));

ALTER TABLE community_comments
  DROP CONSTRAINT IF EXISTS community_comments_moderation_status_check;
ALTER TABLE community_comments
  ADD CONSTRAINT community_comments_moderation_status_check
  CHECK (moderation_status IN ('pending_review', 'approved', 'rejected'));

-- Reports can target a post or a comment. The service-role API is the only
-- reader/writer so users cannot inspect other people's reports.
CREATE TABLE IF NOT EXISTS community_content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment')),
  content_id UUID NOT NULL,
  reporter_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE (reporter_user_id, content_type, content_id)
);

ALTER TABLE community_content_reports ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_community_content_reports_open
  ON community_content_reports (status, created_at);

-- A block is private to the person who created it. The API applies the block
-- to the feed and comments and does not expose this table to client queries.
CREATE TABLE IF NOT EXISTS community_user_blocks (
  blocker_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_user_id, blocked_user_id),
  CHECK (blocker_user_id <> blocked_user_id)
);

ALTER TABLE community_user_blocks ENABLE ROW LEVEL SECURITY;

-- Replace broad read policies with policies that never expose pending/rejected
-- content. Inserts are performed by the authenticated, server-side API after
-- moderation, so direct client inserts are disabled.
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read posts" ON community_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON community_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON community_posts;
DROP POLICY IF EXISTS "Authenticated users can read approved posts" ON community_posts;
DROP POLICY IF EXISTS "Anyone can read comments" ON community_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON community_comments;
DROP POLICY IF EXISTS "Comments are viewable by authenticated users" ON community_comments;
DROP POLICY IF EXISTS "Users can insert their own comments" ON community_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON community_comments;
DROP POLICY IF EXISTS "Authenticated users can read approved comments" ON community_comments;

CREATE POLICY "Authenticated users can read approved posts"
  ON community_posts FOR SELECT TO authenticated
  USING (moderation_status = 'approved');

CREATE POLICY "Authenticated users can read approved comments"
  ON community_comments FOR SELECT TO authenticated
  USING (
    moderation_status = 'approved'
    AND EXISTS (
      SELECT 1 FROM community_posts
      WHERE community_posts.id = community_comments.post_id
        AND community_posts.moderation_status = 'approved'
    )
  );

-- Keep post comment totals accurate when a comment is held or later approved.
CREATE OR REPLACE FUNCTION update_approved_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.moderation_status = 'approved' THEN
      UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.moderation_status = 'approved' THEN
      UPDATE community_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.moderation_status <> 'approved' AND NEW.moderation_status = 'approved' THEN
      UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF OLD.moderation_status = 'approved' AND NEW.moderation_status <> 'approved' THEN
      UPDATE community_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_post_comments ON community_comments;
CREATE TRIGGER trg_post_comments
  AFTER INSERT OR DELETE OR UPDATE OF moderation_status ON community_comments
  FOR EACH ROW EXECUTE FUNCTION update_approved_post_comment_count();
```

After running it, verify the new columns and tables exist in Supabase before deploying the app/API changes. The moderation inbox is admin-only and uses `profiles.is_admin` to authorize access.
