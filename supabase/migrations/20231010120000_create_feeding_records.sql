-- 创建喂养记录表
CREATE TABLE IF NOT EXISTS feeding_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL, -- 关联共用账号
  feeding_time TIMESTAMPTZ NOT NULL,
  feeding_type TEXT NOT NULL,
  amount NUMERIC,
  duration NUMERIC,
  unit TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 开启 RLS
ALTER TABLE feeding_records ENABLE ROW LEVEL SECURITY;

-- 允许用户读写自己的数据
CREATE POLICY "Users can manage their own feeding records" 
ON feeding_records FOR ALL 
USING (auth.uid() = user_id);