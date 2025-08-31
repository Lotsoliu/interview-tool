export interface SmartPrefillConfig {
  // 基于历史记录的智能建议
  suggestCompanies(): string[]
  suggestPositions(company: string): string[]
  
  // 面试过程模板
  getTemplateByType(type: InterviewType): string
  
  // 关键信息提取
  extractKeyInfo(content: string): {
    technologies: string[]
    challenges: string[]
    achievements: string[]
  }
}

export type InterviewType = 'technical' | 'product' | 'business' | 'design' | 'hr' | 'general'

// 面试过程模板
export const interviewTemplates: Record<InterviewType, string> = {
  technical: `
## 技术面试记录模板

### 面试基本信息
- 面试轮次：[一面/二面/三面/终面]
- 面试官：[姓名/职位]
- 面试时长：[具体时间]
- 面试形式：[现场/电话/视频]

### 技术问题回顾
1. **算法题**：
   - 题目描述：[具体题目]
   - 解题思路：[你的思考过程]
   - 代码实现：[是否完整实现]
   - 时空复杂度：[分析结果]
   - 面试官反馈：[是否满意]

2. **系统设计**：
   - 设计要求：[系统需求]
   - 架构方案：[你的设计思路]
   - 技术选型：[选择的技术栈]
   - 扩展性考虑：[如何支持大规模]
   - 讨论深度：[面试官追问程度]

3. **项目深挖**：
   - 项目背景：[业务背景和技术挑战]
   - 你的角色：[在项目中的职责]
   - 技术难点：[遇到的主要问题]
   - 解决方案：[如何解决的]
   - 成果影响：[项目结果和影响]

### 技术基础考察
- 编程语言：[考察的语言和深度]
- 框架经验：[涉及的技术框架]
- 数据库：[数据库相关问题]
- 网络协议：[HTTP/TCP等协议问题]
- 操作系统：[OS相关概念]

### 互动表现
- 沟通清晰度：[1-5分评价]
- 问题理解度：[1-5分评价]  
- 思考逻辑性：[1-5分评价]
- 补充提问：[是否主动提问]
- 学习态度：[对新技术的开放度]

### 特殊亮点
[记录超出预期的表现]

### 需要改进
[记录明显的不足之处]

### 下轮准备
[针对本轮反馈的准备方向]
`,

  product: `
## 产品面试记录模板

### 面试基本信息
- 面试轮次：[一面/二面/三面/终面]
- 面试官：[产品经理/产品总监/CEO]
- 面试时长：[具体时间]
- 面试形式：[现场/电话/视频]

### 产品思维考察
1. **产品分析**：
   - 分析目标：[要求分析的产品]
   - 用户群体：[目标用户分析]
   - 核心功能：[主要功能和价值]
   - 竞品对比：[竞争优势分析]
   - 改进建议：[你的优化想法]

2. **产品设计**：
   - 设计场景：[给定的设计任务]
   - 需求分析：[用户需求挖掘]
   - 功能规划：[功能优先级排序]
   - 原型设计：[是否要求画原型]
   - 数据指标：[如何衡量成功]

3. **项目经验**：
   - 项目背景：[负责的产品项目]
   - 市场调研：[如何了解用户需求]
   - 功能设计：[核心功能设计思路]
   - 协调推进：[如何推动开发]
   - 效果验证：[上线后的数据表现]

### 业务理解
- 行业认知：[对目标行业的理解]
- 商业模式：[盈利模式分析]
- 用户洞察：[用户行为分析]
- 市场趋势：[行业发展趋势]
- 数据分析：[数据驱动决策能力]

### 沟通协作
- 表达能力：[1-5分评价]
- 逻辑思维：[1-5分评价]
- 同理心：[对用户的理解]
- 推动力：[项目推进能力]
- 学习能力：[对新概念的接受度]

### 特殊亮点
[记录产品思维的闪光点]

### 需要改进
[记录需要提升的方面]

### 下轮准备
[针对产品能力的提升方向]
`,

  business: `
## 业务面试记录模板

### 面试基本信息
- 面试轮次：[一面/二面/三面/终面]
- 面试官：[销售总监/业务VP/区域经理]
- 面试时长：[具体时间]
- 面试形式：[现场/电话/视频]

### 业务能力考察
1. **销售经验**：
   - 销售背景：[之前的销售经历]
   - 客户类型：[主要服务的客户群体]
   - 业绩表现：[销售数据和排名]
   - 成功案例：[印象深刻的成单经历]
   - 挑战处理：[如何应对困难客户]

2. **市场理解**：
   - 行业认知：[对目标行业的了解]
   - 竞争分析：[主要竞品和差异]
   - 客户需求：[目标客户的痛点]
   - 市场机会：[发现的市场空白]
   - 价格策略：[如何进行价格谈判]

3. **客户关系**：
   - 获客方式：[如何开发新客户]
   - 关系维护：[如何维护老客户]
   - 需求挖掘：[如何了解客户需求]
   - 方案设计：[如何制定解决方案]
   - 售后服务：[如何处理客户问题]

### 沟通表达
- 表达清晰度：[1-5分评价]
- 说服力：[1-5分评价]
- 倾听能力：[1-5分评价]
- 应变能力：[1-5分评价]
- 专业度：[行业知识掌握]

### 团队协作
- 团队配合：[与内部团队的协作]
- 资源协调：[如何调动资源]
- 信息共享：[团队信息同步]
- 冲突处理：[处理内外部冲突]
- 经验分享：[知识传承能力]

### 特殊亮点
[记录业务能力的突出表现]

### 需要改进
[记录需要提升的业务技能]

### 下轮准备
[针对业务能力的改进方向]
`,

  design: `
## 设计面试记录模板

### 面试基本信息
- 面试轮次：[一面/二面/三面/终面]
- 面试官：[设计总监/UX负责人/产品经理]
- 面试时长：[具体时间]
- 面试形式：[现场/电话/视频/作品展示]

### 设计能力考察
1. **作品集展示**：
   - 项目背景：[设计项目的业务背景]
   - 设计挑战：[面临的主要设计问题]
   - 设计过程：[从调研到最终设计的过程]
   - 解决方案：[设计方案和创新点]
   - 效果验证：[设计效果和用户反馈]

2. **设计思维**：
   - 用户研究：[如何了解用户需求]
   - 信息架构：[如何组织信息结构]
   - 交互设计：[用户体验设计思路]
   - 视觉设计：[视觉风格和设计原则]
   - 可用性测试：[如何验证设计效果]

3. **设计实践**：
   - 设计工具：[使用的设计软件和工具]
   - 设计流程：[从需求到交付的流程]
   - 团队协作：[与产品、开发的协作]
   - 设计规范：[设计系统和规范建设]
   - 持续迭代：[如何根据反馈优化]

### 专业技能
- 设计软件：[Sketch/Figma/PS等熟练度]
- 原型制作：[原型工具使用能力]
- 用户研究：[调研方法和分析能力]
- 视觉表达：[色彩、字体、布局能力]
- 前端理解：[对技术实现的了解]

### 沟通协作
- 设计表达：[1-5分评价]
- 需求理解：[1-5分评价]
- 反馈接受：[1-5分评价]
- 跨团队协作：[1-5分评价]
- 学习能力：[设计趋势敏感度]

### 特殊亮点
[记录设计能力的突出表现]

### 需要改进
[记录需要提升的设计技能]

### 下轮准备
[针对设计能力的改进方向]
`,

  hr: `
## HR面试记录模板

### 面试基本信息
- 面试轮次：[HR初面/HR终面]
- 面试官：[HR专员/HR经理/HRBP]
- 面试时长：[具体时间]
- 面试形式：[现场/电话/视频]

### 个人背景
1. **职业经历**：
   - 工作轨迹：[职业发展路径]
   - 离职原因：[每次离职的主要原因]
   - 职业规划：[3-5年的发展目标]
   - 行业选择：[为什么选择这个行业]
   - 公司偏好：[理想的工作环境]

2. **能力评估**：
   - 核心优势：[最突出的能力]
   - 成就事件：[最有成就感的工作]
   - 挑战应对：[面对困难的处理方式]
   - 学习能力：[如何学习新知识]
   - 团队合作：[在团队中的角色]

3. **求职动机**：
   - 选择原因：[为什么选择这家公司]
   - 岗位理解：[对目标岗位的认知]
   - 期望收获：[希望在这里得到什么]
   - 关注重点：[最关心的工作内容]
   - 发展期望：[在公司的发展预期]

### 价值观匹配
- 工作态度：[对工作的态度和投入度]
- 价值追求：[工作中最看重的是什么]
- 团队融入：[如何与团队协作]
- 企业文化：[对公司文化的理解]
- 抗压能力：[面对压力的应对方式]

### 薪资期望
- 当前薪资：[目前的薪资水平]
- 期望薪资：[期望的薪资范围]
- 薪资构成：[对薪资结构的要求]
- 福利关注：[最关注的福利项目]
- 接受度：[对offer的接受可能性]

### 其他信息
- 入职时间：[可入职的时间]
- 工作地点：[对工作地点的要求]
- 出差接受度：[能否接受出差]
- 加班态度：[对加班的看法]
- 背景调查：[是否同意背景调查]

### 特殊亮点
[记录个人特质的突出表现]

### 需要关注
[记录需要进一步了解的方面]

### 录用建议
[是否推荐进入下一轮]
`,

  general: `
## 通用面试记录模板

### 面试基本信息
- 面试轮次：[一面/二面/三面/终面]
- 面试官：[面试官信息]
- 面试时长：[具体时间]
- 面试形式：[现场/电话/视频]

### 主要问题回顾
1. **专业能力**：
   - 问题1：[具体问题和你的回答]
   - 问题2：[具体问题和你的回答]
   - 问题3：[具体问题和你的回答]

2. **项目经验**：
   - 项目背景：[项目的基本情况]
   - 你的角色：[在项目中的职责]
   - 主要贡献：[你的具体贡献]
   - 遇到挑战：[项目中的困难]
   - 解决方案：[如何解决的]

3. **行为问题**：
   - 团队合作：[团队协作的经历]
   - 解决冲突：[处理冲突的例子]
   - 学习能力：[学习新知识的经历]
   - 抗压能力：[面对压力的应对]

### 互动表现
- 沟通表达：[1-5分评价]
- 思维逻辑：[1-5分评价]
- 专业知识：[1-5分评价]
- 学习态度：[1-5分评价]
- 团队配合：[1-5分评价]

### 特殊亮点
[记录表现突出的方面]

### 需要改进
[记录需要提升的地方]

### 整体感受
[对这次面试的整体感受]

### 下轮准备
[针对反馈的准备方向]
`
}

// 智能预填充服务
export class SmartPrefillService {
  private static instance: SmartPrefillService
  private companySuggestions: string[] = []
  private positionSuggestions: Map<string, string[]> = new Map()

  public static getInstance(): SmartPrefillService {
    if (!SmartPrefillService.instance) {
      SmartPrefillService.instance = new SmartPrefillService()
    }
    return SmartPrefillService.instance
  }

  // 基于历史记录建议公司
  suggestCompanies(): string[] {
    const commonCompanies = [
      '阿里巴巴', '腾讯', '字节跳动', '美团', '滴滴',
      '京东', '网易', '百度', '小米', '华为',
      '拼多多', '快手', '哔哩哔哩', '携程', '蚂蚁集团',
      '微软', '谷歌', 'Facebook', 'Amazon', 'Apple'
    ]
    
    return [...this.companySuggestions, ...commonCompanies]
      .filter((company, index, self) => self.indexOf(company) === index)
      .slice(0, 10)
  }

  // 基于公司建议职位
  suggestPositions(company: string): string[] {
    const companyPositions = this.positionSuggestions.get(company) || []
    
    const commonPositions = [
      '前端工程师', '后端工程师', '全栈工程师', '算法工程师',
      '产品经理', '产品运营', '数据分析师', '项目经理',
      'UI设计师', 'UX设计师', '视觉设计师',
      '销售经理', '商务拓展', '市场营销', '客户成功',
      'HR专员', '运营专员', '测试工程师', '架构师'
    ]
    
    return [...companyPositions, ...commonPositions]
      .filter((position, index, self) => self.indexOf(position) === index)
      .slice(0, 8)
  }

  // 根据职位类型获取模板
  getTemplateByType(positionType: InterviewType): string {
    return interviewTemplates[positionType] || interviewTemplates.general
  }

  // 智能检测面试类型
  detectInterviewType(position: string, company: string): InterviewType {
    const positionLower = position.toLowerCase()
    
    if (/(?:工程师|developer|engineer|程序员|架构师|tech)/i.test(positionLower)) {
      return 'technical'
    }
    
    if (/(?:产品|product|pm|运营)/i.test(positionLower)) {
      return 'product'
    }
    
    if (/(?:销售|sales|business|商务|市场|marketing)/i.test(positionLower)) {
      return 'business'
    }
    
    if (/(?:设计|design|ui|ux|visual)/i.test(positionLower)) {
      return 'design'
    }
    
    if (/(?:hr|人事|招聘|hrbp)/i.test(positionLower)) {
      return 'hr'
    }
    
    return 'general'
  }

  // 从内容中提取关键信息
  extractKeyInfo(content: string): {
    technologies: string[]
    challenges: string[]
    achievements: string[]
  } {
    const technologies = this.extractTechnologies(content)
    const challenges = this.extractChallenges(content)
    const achievements = this.extractAchievements(content)
    
    return { technologies, challenges, achievements }
  }

  private extractTechnologies(content: string): string[] {
    const techKeywords = [
      'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular',
      'Node.js', 'Python', 'Java', 'Go', 'Rust',
      'MySQL', 'PostgreSQL', 'MongoDB', 'Redis',
      'Docker', 'Kubernetes', 'AWS', '微服务', '分布式'
    ]
    
    return techKeywords.filter(tech => 
      content.toLowerCase().includes(tech.toLowerCase())
    )
  }

  private extractChallenges(content: string): string[] {
    const challengePatterns = [
      /遇到.*?困难/g,
      /面临.*?挑战/g,
      /解决.*?问题/g,
      /克服.*?障碍/g
    ]
    
    const challenges: string[] = []
    
    challengePatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) {
        challenges.push(...matches)
      }
    })
    
    return challenges.slice(0, 5)
  }

  private extractAchievements(content: string): string[] {
    const achievementPatterns = [
      /成功.*?实现/g,
      /完成.*?目标/g,
      /获得.*?成果/g,
      /达到.*?效果/g,
      /提升.*?效率/g
    ]
    
    const achievements: string[] = []
    
    achievementPatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) {
        achievements.push(...matches)
      }
    })
    
    return achievements.slice(0, 5)
  }

  // 更新历史建议
  updateSuggestions(company: string, position: string) {
    // 更新公司建议
    if (!this.companySuggestions.includes(company)) {
      this.companySuggestions.unshift(company)
      this.companySuggestions = this.companySuggestions.slice(0, 20)
    }
    
    // 更新职位建议
    const positions = this.positionSuggestions.get(company) || []
    if (!positions.includes(position)) {
      positions.unshift(position)
      this.positionSuggestions.set(company, positions.slice(0, 10))
    }
  }

  // 生成面试准备建议
  generatePreparationTips(positionType: InterviewType, company: string): string[] {
    const baseTips = [
      '提前了解公司背景、业务模式和发展现状',
      '准备STAR法则回答行为问题',
      '准备3-5个问题询问面试官',
      '检查网络、设备，确保面试环境良好'
    ]
    
    const typeTips: Record<InterviewType, string[]> = {
      technical: [
        '复习核心算法和数据结构',
        '准备系统设计思路和案例',
        '梳理项目中的技术难点和解决方案',
        '了解目标公司的技术栈和架构'
      ],
      product: [
        '分析目标公司的产品和竞品',
        '准备产品设计案例和思考过程',
        '了解行业趋势和用户需求',
        '准备数据分析和指标设计案例'
      ],
      business: [
        '了解目标行业和市场情况',
        '准备销售案例和客户关系管理经验',
        '分析竞争对手和差异化优势',
        '准备业绩数据和成功案例'
      ],
      design: [
        '整理最佳作品集和设计案例',
        '准备设计思路和用户研究过程',
        '了解目标公司的设计风格和规范',
        '准备可用性测试和数据验证案例'
      ],
      hr: [
        '梳理职业发展轨迹和规划',
        '准备离职原因的合理解释',
        '了解目标公司文化和价值观',
        '准备薪资期望和谈判策略'
      ],
      general: [
        '准备自我介绍和职业亮点',
        '梳理工作经历和主要成就',
        '准备学习能力和适应性案例'
      ]
    }
    
    return [...baseTips, ...typeTips[positionType]]
  }
}

// 导出单例实例
export const smartPrefillService = SmartPrefillService.getInstance()