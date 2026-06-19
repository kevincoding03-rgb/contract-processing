-- Supabase 数据库初始化脚本

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 分析记录表
CREATE TABLE IF NOT EXISTS analysis_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_analysis_records_user_id ON analysis_records(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_records_created_at ON analysis_records(created_at DESC);

-- RLS 策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_records ENABLE ROW LEVEL SECURITY;

-- 允许已认证用户查看自己的记录
CREATE POLICY "Users can view own records" ON analysis_records
  FOR SELECT USING (user_id = auth.uid()::text OR user_id = 'anonymous');

-- 允许插入记录
CREATE POLICY "Allow insert records" ON analysis_records
  FOR INSERT WITH CHECK (true);

-- 允许已认证用户查看自己的信息
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (id = auth.uid() OR email = 'anonymous@example.com');
