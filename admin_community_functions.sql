-- ============================================================
-- ADMIN DELETION FOR COMMUNITY POSTS & COMMENTS
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Function to securely delete a community post if the caller is an Admin
CREATE OR REPLACE FUNCTION admin_delete_community_post(target_post_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    -- Check if the calling user is an admin
    SELECT profiles.is_admin INTO is_admin
    FROM profiles
    WHERE id = auth.uid();

    IF is_admin = TRUE THEN
        DELETE FROM community_posts WHERE id = target_post_id;
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Unauthorized: User is not an admin';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely delete a community comment if the caller is an Admin
CREATE OR REPLACE FUNCTION admin_delete_community_comment(target_comment_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    -- Check if the calling user is an admin
    SELECT profiles.is_admin INTO is_admin
    FROM profiles
    WHERE id = auth.uid();

    IF is_admin = TRUE THEN
        DELETE FROM community_comments WHERE id = target_comment_id;
        RETURN TRUE;
    ELSE
        RAISE EXCEPTION 'Unauthorized: User is not an admin';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
