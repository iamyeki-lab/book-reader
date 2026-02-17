-- feedback_messages: 用户留言 + 管理员回复
CREATE TABLE IF NOT EXISTS feedback_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  content TEXT NOT NULL,
  admin_reply TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_messages_user_id ON feedback_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_messages_created_at ON feedback_messages(created_at DESC);

ALTER TABLE feedback_messages ENABLE ROW LEVEL SECURITY;

-- 所有人可插入留言（提交反馈）
CREATE POLICY "feedback_insert" ON feedback_messages
  FOR INSERT WITH CHECK (true);

-- 登录用户可查看自己的留言及回复
CREATE POLICY "feedback_select_own" ON feedback_messages
  FOR SELECT USING (auth.uid() = user_id);

-- 管理员可查看所有留言，并更新（回复）
CREATE POLICY "feedback_admin_select" ON feedback_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email')
  );
CREATE POLICY "feedback_admin_update" ON feedback_messages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE email = auth.jwt() ->> 'email')
  );
