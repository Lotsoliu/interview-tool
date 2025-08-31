export interface PromptConfig {
  industry: string
  positionType: 'technical' | 'product' | 'business' | 'design' | 'general'
  experienceLevel: 'junior' | 'mid' | 'senior'
  analysisDepth: 'basic' | 'detailed' | 'comprehensive'
}

export interface AnalysisDimension {
  category: string
  weight: number
  criteria: string[]
}

export interface InterviewContext {
  company: string
  position: string
  interviewDate: string
  interviewProcess: string
}

// 技术岗位专用分析维度
const technicalDimensions: AnalysisDimension[] = [
  {
    category: '技术能力',
    weight: 0.4,
    criteria: [
      '算法和数据结构掌握程度',
      '系统设计思维和架构能力',
      '编程实践和代码质量意识',
      '技术深度vs广度的平衡',
      '新技术学习和适应能力'
    ]
  },
  {
    category: '工程实践',
    weight: 0.3,
    criteria: [
      'Git版本控制和协作流程',
      '单元测试和代码review习惯',
      'CI/CD和DevOps理解',
      '性能优化和监控经验',
      '文档编写和知识分享'
    ]
  },
  {
    category: '问题解决',
    weight: 0.2,
    criteria: [
      '分析问题的系统性思维',
      '调试和排错的逻辑性',
      '技术选型的合理性判断',
      '在约束条件下的创新能力',
      '跨团队技术沟通能力'
    ]
  },
  {
    category: '成长潜力',
    weight: 0.1,
    criteria: [
      '技术好奇心和主动学习',
      '对业务理解的深度',
      '团队协作和mentor能力',
      '技术视野和行业趋势把握',
      '抗压能力和适应性'
    ]
  }
]

// 产品岗位专用分析维度
const productDimensions: AnalysisDimension[] = [
  {
    category: '产品思维',
    weight: 0.35,
    criteria: [
      '用户需求分析和洞察能力',
      '市场竞品分析和定位',
      '产品规划和路线图制定',
      '数据驱动的决策思维',
      '商业模式和盈利理解'
    ]
  },
  {
    category: '执行能力',
    weight: 0.3,
    criteria: [
      '项目管理和里程碑把控',
      '跨团队协调和推进',
      '需求文档和原型设计',
      '上线后效果跟踪评估',
      '风险识别和应对策略'
    ]
  },
  {
    category: '沟通协作',
    weight: 0.25,
    criteria: [
      '与技术团队的有效沟通',
      '向上汇报和决策建议',
      '用户访谈和反馈收集',
      '跨部门利益平衡协调',
      '会议主持和推进效率'
    ]
  },
  {
    category: '学习成长',
    weight: 0.1,
    criteria: [
      '行业趋势和新技术敏感度',
      '失败项目的复盘总结',
      '持续优化的改进意识',
      '知识体系的完善程度',
      '个人影响力的建设'
    ]
  }
]

// 业务岗位专用分析维度
const businessDimensions: AnalysisDimension[] = [
  {
    category: '业务理解',
    weight: 0.35,
    criteria: [
      '行业背景和商业模式理解',
      '客户需求和痛点分析',
      '竞争格局和市场机会',
      '业务流程和效率优化',
      '商业数据分析和解读'
    ]
  },
  {
    category: '销售能力',
    weight: 0.3,
    criteria: [
      '客户关系建立和维护',
      '需求挖掘和方案匹配',
      '谈判技巧和成交能力',
      '销售目标达成和预测',
      '客户满意度和续约率'
    ]
  },
  {
    category: '沟通表达',
    weight: 0.25,
    criteria: [
      'PPT制作和汇报能力',
      '书面表达和邮件沟通',
      '客户presentation技巧',
      '跨文化和多层级沟通',
      '冲突处理和协商能力'
    ]
  },
  {
    category: '自我驱动',
    weight: 0.1,
    criteria: [
      '目标设定和执行力',
      '时间管理和优先级',
      '主动学习和技能提升',
      '抗压能力和韧性',
      '团队合作和领导力'
    ]
  }
]

// 获取职位类型对应的分析维度
export function getAnalysisDimensions(positionType: string): AnalysisDimension[] {
  switch (positionType) {
    case 'technical':
      return technicalDimensions
    case 'product':
      return productDimensions
    case 'business':
      return businessDimensions
    default:
      return technicalDimensions // 默认使用技术岗位维度
  }
}

// 智能识别职位类型
export function detectPositionType(position: string): 'technical' | 'product' | 'business' | 'design' | 'general' {
  const positionLower = position.toLowerCase()
  
  // 技术岗位关键词
  if (/(?:工程师|developer|engineer|程序员|架构师|tech|frontend|backend|fullstack|devops)/i.test(positionLower)) {
    return 'technical'
  }
  
  // 产品岗位关键词
  if (/(?:产品|product|pm|运营|operation)/i.test(positionLower)) {
    return 'product'
  }
  
  // 业务岗位关键词
  if (/(?:销售|sales|business|商务|market|运营|bd)/i.test(positionLower)) {
    return 'business'
  }
  
  // 设计岗位关键词
  if (/(?:设计|design|ui|ux|visual)/i.test(positionLower)) {
    return 'design'
  }
  
  return 'general'
}

// 生成技术岗位专用提示词
export function generateTechnicalPrompt(context: InterviewContext): string {
  const dimensions = getAnalysisDimensions('technical')
  
  return `
作为资深技术面试官，请基于以下信息对面试表现进行专业分析：

面试基本信息：
- 目标公司：${context.company}（请分析公司技术栈和文化特点）
- 应聘职位：${context.position}（请识别核心技能要求）
- 面试时间：${context.interviewDate}
- 详细过程：${context.interviewProcess}

请从以下专业维度进行分析：

🧠 **第一步：技术能力评估**
分析维度：
${dimensions[0].criteria.map(item => `- ${item}`).join('\n')}

💡 **第二步：软技能表现**
分析维度：
${dimensions[1].criteria.map(item => `- ${item}`).join('\n')}

⚡ **第三步：改进建议制定**
请为每个改进点提供：
- 具体学习资源（书籍、课程、项目）
- 量化的练习计划（时间安排、里程碑）
- 可验证的成果标准
- 优先级评估（P0/P1/P2）

📊 **第四步：量化评分体系**
技术能力（40%）：算法_/10 + 系统设计_/10 + 工程实践_/10 + 技术视野_/10
软技能（30%）：沟通表达_/10 + 团队协作_/10 + 学习能力_/10
匹配度（30%）：岗位契合_/10 + 公司文化_/10 + 成长潜力_/10
综合评分：__/10

最后请以JSON格式返回完整结果，格式如下：
{
  "strengths": ["优点1", "优点2", "优点3"],
  "weaknesses": ["缺点1", "缺点2", "缺点3"],
  "improvements": [
    {
      "title": "改进项标题",
      "description": "详细描述，包含具体的学习路径和时间规划",
      "priority": "high/medium/low",
      "estimatedDuration": "预计完成时间（周）",
      "resources": ["推荐资源1", "推荐资源2"],
      "milestones": ["里程碑1", "里程碑2"]
    }
  ],
  "overallScore": 8,
  "summary": "整体评价和建议",
  "scoreBreakdown": {
    "technical": 8,
    "softSkills": 7,
    "fitMatch": 8
  }
}
`
}

// 生成产品岗位专用提示词
export function generateProductPrompt(context: InterviewContext): string {
  const dimensions = getAnalysisDimensions('product')
  
  return `
作为资深产品面试官，请基于以下信息对面试表现进行专业分析：

面试基本信息：
- 目标公司：${context.company}（请分析公司产品战略和市场定位）
- 应聘职位：${context.position}（请识别核心产品技能要求）
- 面试时间：${context.interviewDate}
- 详细过程：${context.interviewProcess}

请从以下专业维度进行分析：

🎯 **第一步：产品思维评估**
分析维度：
${dimensions[0].criteria.map(item => `- ${item}`).join('\n')}

🚀 **第二步：执行能力分析**
分析维度：
${dimensions[1].criteria.map(item => `- ${item}`).join('\n')}

💬 **第三步：沟通协作能力**
分析维度：
${dimensions[2].criteria.map(item => `- ${item}`).join('\n')}

📈 **第四步：改进建议制定**
请为每个改进点提供：
- 产品实战项目建议
- 相关书籍和课程推荐
- 可量化的成长指标
- 短期（1-3月）和长期（6-12月）目标

最后请以JSON格式返回完整结果，包含产品岗位专用的评分维度和学习路径。
`
}

// 生成业务岗位专用提示词
export function generateBusinessPrompt(context: InterviewContext): string {
  const dimensions = getAnalysisDimensions('business')
  
  return `
作为资深业务面试官，请基于以下信息对面试表现进行专业分析：

面试基本信息：
- 目标公司：${context.company}（请分析公司业务模式和市场地位）
- 应聘职位：${context.position}（请识别核心业务技能要求）
- 面试时间：${context.interviewDate}
- 详细过程：${context.interviewProcess}

请从以下专业维度进行分析：

🏢 **第一步：业务理解深度**
分析维度：
${dimensions[0].criteria.map(item => `- ${item}`).join('\n')}

💼 **第二步：销售执行能力**
分析维度：
${dimensions[1].criteria.map(item => `- ${item}`).join('\n')}

🗣️ **第三步：沟通表达技巧**
分析维度：
${dimensions[2].criteria.map(item => `- ${item}`).join('\n')}

🎯 **第四步：改进建议制定**
请为每个改进点提供：
- 业务技能提升计划
- 行业知识学习资源
- 客户关系建设策略
- 销售技巧训练方法

最后请以JSON格式返回完整结果，包含业务岗位专用的评分维度和发展建议。
`
}

// 主要的提示词生成函数
export function generateAdaptivePrompt(context: InterviewContext): string {
  const positionType = detectPositionType(context.position)
  
  switch (positionType) {
    case 'technical':
      return generateTechnicalPrompt(context)
    case 'product':
      return generateProductPrompt(context)
    case 'business':
      return generateBusinessPrompt(context)
    default:
      return generateTechnicalPrompt(context) // 默认使用技术岗位模板
  }
}

// 提示词优化配置
export const promptOptimizations = {
  // 增加上下文理解
  includeCompanyContext: true,
  // 个性化分析深度
  adaptiveAnalysisDepth: true,
  // 量化评分体系
  quantifiedScoring: true,
  // 学习路径规划
  learningPathGeneration: true,
  // 时间线管理
  timelineEstimation: true
}