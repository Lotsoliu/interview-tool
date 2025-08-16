# 面试复盘助手

一个基于Next.js、Tailwind CSS和豆包API的面试复盘工具，帮助用户记录面试过程并获得专业的分析和改进建议。

## 🚀 新功能：流式输出

**AI思考过程实时展示** - 现在您可以实时看到豆包AI分析面试的思考过程！

### ✨ 流式输出特性
- **实时显示**：逐字显示AI的思考过程
- **步骤可视化**：清晰的进度指示器和步骤跟踪
- **透明分析**：完全透明的AI分析过程
- **智能解析**：自动识别JSON结果并完成分析

### 🎯 流式输出演示
访问 `/demo` 页面体验流式输出的魅力！

## 功能特性

- 📝 **面试记录管理**：记录公司、职位、面试时间和详细过程
- 🤖 **AI智能分析**：集成豆包API，自动分析面试表现
- 🌊 **流式输出**：实时显示AI思考过程，提升用户体验
- ✅ **改进建议跟踪**：生成具体的改进项目和待办事项
- 📊 **可视化展示**：清晰展示优点、缺点和改进建议
- ✏️ **编辑功能**：支持修改面试记录和标记完成状态
- 🎨 **现代UI设计**：使用Tailwind CSS构建美观的用户界面

## 技术栈

- **前端框架**：Next.js 14 + React 18
- **样式框架**：Tailwind CSS
- **AI服务**：豆包API (doubao-seed-1-6-thinking-250715)
- **开发语言**：TypeScript
- **图标库**：Lucide React
- **日期处理**：date-fns
- **流式技术**：Server-Sent Events (SSE) + ReadableStream

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

创建 `.env.local` 文件并配置以下环境变量：

```env
# 豆包API配置
NEXT_PUBLIC_DOUBAO_API_KEY=a96ad080-652f-4a6d-aa22-616cede91d37
NEXT_PUBLIC_DOUBAO_API_URL=https://ark.cn-beijing.volces.com/api/v3/chat/completions

# Supabase配置（可选，用于数据持久化）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 使用说明

### 添加面试记录

1. 点击"添加面试记录"按钮
2. 填写公司名称、应聘职位、面试时间和详细过程
3. 选择是否启用流式输出（推荐开启）
4. 点击"保存并分析"，系统将调用豆包API进行分析
5. 实时观看AI的思考过程（如果启用流式输出）
6. 查看AI生成的优点、缺点和改进建议

### 流式输出体验

1. 在添加面试记录时勾选"启用流式输出"
2. 观察AI逐步分析的过程：
   - 第一步：分析面试表现优点
   - 第二步：识别需要改进的地方
   - 第三步：提出具体的改进建议
   - 第四步：给出整体评分和总结
3. 体验实时进度指示器和步骤跟踪

### 管理面试记录

- **查看详情**：点击展开按钮查看完整的面试分析
- **编辑记录**：点击编辑按钮修改面试信息
- **标记完成**：点击改进建议前的圆圈标记完成状态
- **删除记录**：点击删除按钮移除不需要的记录

## 项目结构

```
interview-tool/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   │   └── analyze/       # 流式分析API
│   ├── demo/              # 流式输出演示页面
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── components/             # React组件
│   ├── InterviewForm.tsx  # 面试记录表单
│   ├── InterviewList.tsx  # 面试记录列表
│   └── StreamingAnalysis.tsx # 流式分析显示组件
├── lib/                    # 工具库
│   └── doubao.ts          # 豆包API服务
├── types/                  # TypeScript类型定义
│   └── interview.ts       # 面试相关类型
├── package.json            # 项目依赖
├── tailwind.config.js      # Tailwind配置
└── README.md              # 项目说明
```

## 流式输出技术实现

### 前端实现
- 使用React Hooks管理流式状态
- 自定义StreamingAnalysis组件展示实时内容
- 智能步骤识别和进度跟踪
- 响应式设计和动画效果

### 后端实现
- Next.js API Routes处理流式请求
- Server-Sent Events (SSE)格式输出
- ReadableStream处理流式数据
- 豆包API流式调用集成

### 数据流
```
用户输入 → 前端表单 → API路由 → 豆包API → 流式响应 → 前端展示
```

## 豆包API集成

项目集成了豆包API进行面试分析，支持两种模式：

### 普通模式
```typescript
const analysis = await analyzeInterview(interview)
```

### 流式模式
```typescript
await analyzeInterviewStreamAPI(
  interview,
  (chunk) => console.log(chunk), // 实时内容回调
  (analysis) => console.log(analysis), // 完成回调
  (error) => console.error(error) // 错误回调
)
```

## 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

## 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

## 许可证

MIT License
