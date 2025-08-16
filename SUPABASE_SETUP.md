# Supabase 设置指南

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com/) 并登录
2. 点击 "New Project" 创建新项目
3. 选择组织并填写项目信息
4. 等待项目创建完成

## 2. 获取项目配置

1. 在项目仪表板中，点击左侧菜单的 "Settings" → "API"
2. 复制以下信息：
   - **Project URL** (例如: `https://your-project.supabase.co`)
   - **anon public** key (以 `eyJ...` 开头的长字符串)

## 3. 配置环境变量

在项目根目录创建 `.env.local` 文件，添加以下配置：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 豆包API配置
NEXT_PUBLIC_DOUBAO_API_KEY=a96ad080-652f-4a6d-aa22-616cede91d37
NEXT_PUBLIC_DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3/chat/completions
```

## 4. 创建数据库表

1. 在 Supabase 仪表板中，点击左侧菜单的 "SQL Editor"
2. 点击 "New query"
3. 复制并粘贴 `supabase/schema.sql` 文件中的内容
4. 点击 "Run" 执行 SQL 语句

## 5. 验证设置

1. 在 "Table Editor" 中查看是否创建了 `interviews` 表
2. 检查表结构是否正确
3. 查看是否有示例数据

## 6. 测试连接

1. 启动项目：`npm run dev`
2. 访问主页面，尝试添加面试记录
3. 检查数据是否成功保存到数据库

## 7. 数据库表结构

### interviews 表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | TEXT | 主键，面试记录唯一标识 |
| company | TEXT | 公司名称 |
| position | TEXT | 应聘职位 |
| interview_date | DATE | 面试日期 |
| interview_process | TEXT | 面试过程记录 |
| analysis | JSONB | AI分析结果（JSON格式） |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 索引

- `idx_interviews_company`: 公司名称索引
- `idx_interviews_position`: 职位索引
- `idx_interviews_date`: 日期索引
- `idx_interviews_created_at`: 创建时间索引
- `idx_interviews_search`: 全文搜索索引

### 视图

- `interview_stats`: 面试统计信息
- `improvement_stats`: 改进建议统计

## 8. 故障排除

### 常见问题

1. **连接失败**
   - 检查环境变量是否正确
   - 确认 Supabase 项目是否正常运行

2. **表不存在**
   - 检查 SQL 是否执行成功
   - 查看 SQL Editor 中的错误信息

3. **权限错误**
   - 检查 RLS 策略设置
   - 确认 API 密钥权限

4. **数据类型错误**
   - 检查 JSONB 字段格式
   - 确认日期格式正确

### 调试技巧

1. 查看浏览器控制台错误信息
2. 检查 Supabase 仪表板的日志
3. 使用 SQL Editor 直接查询数据
4. 验证环境变量是否正确加载

## 9. 生产环境注意事项

1. **安全性**
   - 启用适当的 RLS 策略
   - 限制用户权限
   - 使用环境变量管理敏感信息

2. **性能**
   - 监控查询性能
   - 优化索引策略
   - 定期清理旧数据

3. **备份**
   - 启用自动备份
   - 定期测试恢复流程
   - 监控备份状态

## 10. 更多资源

- [Supabase 官方文档](https://supabase.com/docs)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [Next.js 环境变量](https://nextjs.org/docs/basic-features/environment-variables)
