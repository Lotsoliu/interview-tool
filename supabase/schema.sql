-- 创建面试记录表
CREATE TABLE IF NOT EXISTS interviews (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  interview_date DATE NOT NULL,
  interview_process TEXT NOT NULL,
  analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_interviews_company ON interviews(company);
CREATE INDEX IF NOT EXISTS idx_interviews_position ON interviews(position);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews(interview_date);
CREATE INDEX IF NOT EXISTS idx_interviews_created_at ON interviews(created_at);

-- 启用行级安全策略
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有操作（在生产环境中应该限制用户权限）
CREATE POLICY "Allow all operations" ON interviews
  FOR ALL USING (true)
  WITH CHECK (true);

-- 创建函数来自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 创建全文搜索索引
CREATE INDEX IF NOT EXISTS idx_interviews_search ON interviews 
  USING gin(to_tsvector('chinese', company || ' ' || position || ' ' || interview_process));

-- 创建统计视图
CREATE OR REPLACE VIEW interview_stats AS
SELECT 
  COUNT(*) as total_interviews,
  COUNT(DISTINCT company) as unique_companies,
  COUNT(DISTINCT position) as unique_positions,
  AVG((analysis->>'overallScore')::numeric) as avg_score,
  MIN(created_at) as first_interview,
  MAX(created_at) as last_interview
FROM interviews;

-- 创建改进建议统计视图
CREATE OR REPLACE VIEW improvement_stats AS
SELECT 
  i.id as interview_id,
  i.company,
  i.position,
  COUNT(imp) as total_improvements,
  COUNT(imp) FILTER (WHERE (imp->>'completed')::boolean = true) as completed_improvements,
  COUNT(imp) FILTER (WHERE (imp->>'priority') = 'high') as high_priority,
  COUNT(imp) FILTER (WHERE (imp->>'priority') = 'medium') as medium_priority,
  COUNT(imp) FILTER (WHERE (imp->>'priority') = 'low') as low_priority
FROM interviews i,
     jsonb_array_elements(i.analysis->'improvements') as imp
GROUP BY i.id, i.company, i.position;

-- 插入示例数据（可选）
INSERT INTO interviews (id, company, position, interview_date, interview_process, analysis) VALUES
(
  'sample-1',
  '示例公司',
  '前端工程师',
  '2024-01-01',
  '这是一个示例面试记录，用于测试系统功能。面试过程中我表现良好，技术问题回答得不错，但项目经验需要提升。',
  '{
    "strengths": ["技术基础扎实", "学习能力强", "沟通表达清晰"],
    "weaknesses": ["项目经验不足", "技术深度有待提升"],
    "improvements": [
      {
        "id": "imp-1",
        "title": "增加项目实践经验",
        "description": "主动参与开源项目，积累实战经验",
        "priority": "high",
        "completed": false
      }
    ],
    "overallScore": 7,
    "summary": "整体表现良好，有提升空间"
  }'
) ON CONFLICT (id) DO NOTHING;
