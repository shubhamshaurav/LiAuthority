-- ==========================================
-- Add category and tags to posts for calendar views
-- ==========================================

ALTER TABLE liauthority.posts
    ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'thought_leadership',
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- category values: 'thought_leadership', 'story', 'carousel', 'poll', 'announcement'
-- tags: free-form array e.g. {'linkedin', 'growth', 'personal'}
