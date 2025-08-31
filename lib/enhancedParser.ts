import { InterviewAnalysis, ImprovementItem, LearningPath } from '../types/interview'

export interface ParseStrategy {
  name: string
  parse(content: string): InterviewAnalysis | null
}

export interface PriorityCalculation {
  impact: number        // 影响程度 1-10
  urgency: number      // 紧急程度 1-10  
  difficulty: number   // 改进难度 1-10
  timeframe: number    // 预期周期（周）
  dependency: string[] // 依赖技能
}

// JSON提取策略
export class JsonExtractionStrategy implements ParseStrategy {
  name = 'JsonExtraction'

  parse(content: string): InterviewAnalysis | null {
    try {
      // 查找JSON块
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return null

      const jsonStr = jsonMatch[0]
      const parsed = JSON.parse(jsonStr)
      
      // 验证必需字段
      if (!this.validateResult(parsed)) return null
      
      return this.enhanceResult(parsed)
    } catch (error) {
      console.warn('JSON extraction failed:', error)
      return null
    }
  }

  private validateResult(result: any): boolean {
    return (
      result &&
      Array.isArray(result.strengths) &&
      Array.isArray(result.weaknesses) &&
      Array.isArray(result.improvements) &&
      typeof result.overallScore === 'number' &&
      typeof result.summary === 'string'
    )
  }

  private enhanceResult(result: any): InterviewAnalysis {
    // 确保改进项有完整的结构
    const improvements = result.improvements.map((imp: any, index: number) => ({
      id: imp.id || `improvement_${Date.now()}_${index}`,
      title: imp.title || '改进建议',
      description: imp.description || '',
      priority: imp.priority || 'medium',
      completed: false,
      estimatedDuration: imp.estimatedDuration,
      resources: imp.resources || [],
      milestones: imp.milestones || [],
      tags: this.extractTags(imp.title, imp.description),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))

    return {
      ...result,
      improvements: this.prioritizeImprovements(improvements),
      positionType: this.detectPositionType(result)
    }
  }

  public extractTags(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase()
    const tags: string[] = []

    // 技术相关标签
    if (/算法|algorithm|数据结构/.test(text)) tags.push('algorithm')
    if (/系统设计|架构|system.*design/.test(text)) tags.push('system-design')
    if (/沟通|表达|communication/.test(text)) tags.push('communication')
    if (/团队|协作|team|collaboration/.test(text)) tags.push('teamwork')
    if (/项目管理|project.*management/.test(text)) tags.push('project-management')
    if (/学习|学习能力|learning/.test(text)) tags.push('learning')
    if (/编程|coding|代码/.test(text)) tags.push('coding')
    if (/测试|test|qa/.test(text)) tags.push('testing')

    return tags
  }

  private detectPositionType(result: any): 'technical' | 'product' | 'business' | 'design' | 'general' {
    const content = JSON.stringify(result).toLowerCase()
    
    if (/技术|算法|编程|代码|系统设计/.test(content)) return 'technical'
    if (/产品|用户|需求|原型/.test(content)) return 'product'
    if (/销售|客户|业务|商务/.test(content)) return 'business'
    if (/设计|ui|ux|视觉/.test(content)) return 'design'
    
    return 'general'
  }

  private prioritizeImprovements(improvements: ImprovementItem[]): ImprovementItem[] {
    return improvements.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }
}

// 结构化文本策略
export class StructuredTextStrategy implements ParseStrategy {
  name = 'StructuredText'

  parse(content: string): InterviewAnalysis | null {
    try {
      const sections = this.extractSections(content)
      
      return {
        strengths: this.extractListItems(sections.strengths),
        weaknesses: this.extractListItems(sections.weaknesses),
        improvements: this.extractImprovements(sections.improvements),
        overallScore: this.extractScore(sections.score) || 7,
        summary: sections.summary || '整体表现良好，继续保持积极的学习态度。'
      }
    } catch (error) {
      console.warn('Structured text parsing failed:', error)
      return null
    }
  }

  private extractSections(content: string) {
    const sections: Record<string, string> = {}
    
    // 使用正则表达式提取各部分
    const strengthsMatch = content.match(/(?:优点|优势|表现良好)([\s\S]*?)(?:缺点|不足|需要改进|建议)/i)
    sections.strengths = strengthsMatch?.[1] || ''
    
    const weaknessesMatch = content.match(/(?:缺点|不足|需要改进)([\s\S]*?)(?:建议|改进|评分)/i)
    sections.weaknesses = weaknessesMatch?.[1] || ''
    
    const improvementsMatch = content.match(/(?:建议|改进|行动计划)([\s\S]*?)(?:评分|总结|整体)/i)
    sections.improvements = improvementsMatch?.[1] || ''
    
    const scoreMatch = content.match(/(?:评分|得分|分数)[\s\S]*?(\d+)/i)
    sections.score = scoreMatch?.[1] || ''
    
    const summaryMatch = content.match(/(?:总结|整体|综合)([\s\S]*)$/i)
    sections.summary = summaryMatch?.[1] || ''
    
    return sections
  }

  private extractListItems(text: string): string[] {
    if (!text) return []
    
    // 匹配多种列表格式
    const patterns = [
      /(?:^|\n)\s*[•\-\*]\s*(.+)/gm,  // - 或 • 列表
      /(?:^|\n)\s*\d+[\.\)]\s*(.+)/gm, // 数字列表
      /(?:^|\n)\s*[一二三四五六七八九十]\s*[、\.]\s*(.+)/gm // 中文数字
    ]
    
    const items: string[] = []
    for (const pattern of patterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        const item = match[1].trim()
        if (item && !items.includes(item)) {
          items.push(item)
        }
      }
    }
    
    return items.length > 0 ? items : this.fallbackExtraction(text)
  }

  private fallbackExtraction(text: string): string[] {
    // 兜底：按句号分割并清理
    return text
      .split(/[。！？\.]/)
      .map(item => item.trim())
      .filter(item => item.length > 5 && item.length < 200)
      .slice(0, 5) // 最多取5项
  }

  private extractImprovements(text: string): ImprovementItem[] {
    const items = this.extractListItems(text)
    
    return items.map((item, index) => ({
      id: `improvement_text_${Date.now()}_${index}`,
      title: this.extractTitle(item),
      description: item,
      priority: this.guessPriority(item),
      completed: false,
      tags: this.extractTags(item),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
  }

  private extractTitle(text: string): string {
    // 提取标题：取第一句话或前20个字符
    const sentences = text.split(/[，。：；]/)
    const title = sentences[0].trim()
    return title.length > 30 ? title.substring(0, 30) + '...' : title
  }

  private guessPriority(text: string): 'high' | 'medium' | 'low' {
    const highKeywords = ['重要', '关键', '核心', '必须', '急需', '迫切']
    const lowKeywords = ['可以', '建议', '尝试', '考虑', '适当']
    
    const textLower = text.toLowerCase()
    
    if (highKeywords.some(keyword => textLower.includes(keyword))) {
      return 'high'
    }
    if (lowKeywords.some(keyword => textLower.includes(keyword))) {
      return 'low'
    }
    return 'medium'
  }

  private extractTags(text: string): string[] {
    // 复用JsonExtractionStrategy的extractTags方法
    return new JsonExtractionStrategy().extractTags('', text)
  }

  private extractScore(scoreText: string): number | null {
    const match = scoreText.match(/(\d+(?:\.\d+)?)/)
    return match ? parseFloat(match[1]) : null
  }
}

// NLP分析策略（未来扩展）
export class NLPAnalysisStrategy implements ParseStrategy {
  name = 'NLPAnalysis'

  parse(content: string): InterviewAnalysis | null {
    // 这里可以集成更高级的NLP库
    // 目前返回null，让其他策略处理
    return null
  }
}

// 兜底策略
export class FallbackStrategy implements ParseStrategy {
  name = 'Fallback'

  parse(content: string): InterviewAnalysis | null {
    return {
      strengths: ['表现积极，态度认真'],
      weaknesses: ['需要进一步提升专业技能'],
      improvements: [{
        id: `fallback_${Date.now()}`,
        title: '继续学习和实践',
        description: '建议继续深入学习相关技能，多参与实际项目练习',
        priority: 'medium' as const,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }],
      overallScore: 7,
      summary: '整体表现良好，继续努力！'
    }
  }
}

// 智能优先级计算
export function calculatePriority(item: PriorityCalculation): number {
  const impactWeight = 0.4
  const urgencyWeight = 0.3
  const difficultyWeight = -0.2  // 难度越高优先级越低
  const timeframeWeight = -0.1   // 周期越长优先级越低
  
  return (
    item.impact * impactWeight +
    item.urgency * urgencyWeight +
    (10 - item.difficulty) * difficultyWeight +
    (20 - item.timeframe) * timeframeWeight
  )
}

// 主要的结果解析器
export class AdvancedResultParser {
  private strategies: ParseStrategy[]

  constructor() {
    this.strategies = [
      new JsonExtractionStrategy(),
      new StructuredTextStrategy(),
      new NLPAnalysisStrategy(),
      new FallbackStrategy()
    ]
  }

  parseStreamingResult(content: string): InterviewAnalysis {
    console.log('🔍 开始智能解析结果...')
    
    for (const strategy of this.strategies) {
      try {
        console.log(`📝 尝试策略: ${strategy.name}`)
        const result = strategy.parse(content)
        
        if (result && this.validateResult(result)) {
          console.log(`✅ 策略 ${strategy.name} 解析成功`)
          return this.enhanceResult(result)
        }
      } catch (error) {
        console.warn(`❌ 策略 ${strategy.name} 失败:`, error)
      }
    }
    
    throw new Error('所有解析策略都失败')
  }

  private validateResult(result: InterviewAnalysis): boolean {
    return !!(
      result.strengths?.length &&
      result.weaknesses?.length &&
      result.improvements?.length &&
      result.overallScore &&
      result.summary
    )
  }

  private enhanceResult(result: InterviewAnalysis): InterviewAnalysis {
    return {
      ...result,
      improvements: this.prioritizeImprovements(result.improvements),
      scoreBreakdown: this.generateScoreBreakdown(result)
    }
  }

  private prioritizeImprovements(improvements: ImprovementItem[]): ImprovementItem[] {
    return improvements
      .sort((a, b) => {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
      .map((item, index) => ({
        ...item,
        // 为高优先级项目设置更短的预期完成时间
        estimatedDuration: item.estimatedDuration || this.estimateDuration(item.priority),
        // 根据内容推荐资源
        resources: item.resources?.length ? item.resources : this.recommendResources(item)
      }))
  }

  private estimateDuration(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
      case 'high': return '1-2周'
      case 'medium': return '2-4周'  
      case 'low': return '4-8周'
      default: return '2-4周'
    }
  }

  private recommendResources(item: ImprovementItem): string[] {
    const resources: string[] = []
    const tags = item.tags || []
    
    if (tags.includes('algorithm')) {
      resources.push('LeetCode算法练习', '《算法导论》')
    }
    if (tags.includes('system-design')) {
      resources.push('《设计数据密集型应用》', '系统设计面试题集')
    }
    if (tags.includes('communication')) {
      resources.push('《金字塔原理》', 'Toastmasters演讲俱乐部')
    }
    if (tags.includes('coding')) {
      resources.push('Clean Code编码规范', 'GitHub开源项目贡献')
    }
    
    return resources.length > 0 ? resources : ['相关技术博客', '在线课程平台']
  }

  private generateScoreBreakdown(result: InterviewAnalysis) {
    // 根据positionType生成对应的评分细分
    const positionType = result.positionType || 'general'
    
    switch (positionType) {
      case 'technical':
        return {
          technical: Math.round(result.overallScore * 0.9),
          softSkills: Math.round(result.overallScore * 0.8),
          fitMatch: Math.round(result.overallScore * 1.1)
        }
      case 'product':
        return {
          product: Math.round(result.overallScore * 0.95),
          softSkills: Math.round(result.overallScore * 1.05),
          fitMatch: Math.round(result.overallScore * 0.9)
        }
      case 'business':
        return {
          business: Math.round(result.overallScore * 0.9),
          softSkills: Math.round(result.overallScore * 1.1),
          fitMatch: Math.round(result.overallScore * 0.95)
        }
      default:
        return {
          technical: result.overallScore,
          softSkills: result.overallScore,
          fitMatch: result.overallScore
        }
    }
  }
}

// 学习路径生成器
export class LearningPathGenerator {
  generatePath(improvements: ImprovementItem[], positionType: string): LearningPath[] {
    const skillGroups = this.groupBySkill(improvements)
    
    return Object.entries(skillGroups).map(([skill, items]) => ({
      skill,
      currentLevel: this.assessCurrentLevel(items),
      targetLevel: this.determineTargetLevel(items),
      estimatedDuration: this.calculateDuration(items),
      milestones: this.generateMilestones(items),
      resources: this.aggregateResources(items),
      practiceProjects: this.suggestProjects(skill, positionType)
    }))
  }

  private groupBySkill(improvements: ImprovementItem[]): Record<string, ImprovementItem[]> {
    const groups: Record<string, ImprovementItem[]> = {}
    
    improvements.forEach(item => {
      const primaryTag = item.tags?.[0] || 'general'
      if (!groups[primaryTag]) {
        groups[primaryTag] = []
      }
      groups[primaryTag].push(item)
    })
    
    return groups
  }

  private assessCurrentLevel(items: ImprovementItem[]): 'beginner' | 'intermediate' | 'advanced' {
    const highPriorityCount = items.filter(item => item.priority === 'high').length
    const ratio = highPriorityCount / items.length
    
    if (ratio > 0.6) return 'beginner'
    if (ratio > 0.3) return 'intermediate'
    return 'advanced'
  }

  private determineTargetLevel(items: ImprovementItem[]): 'intermediate' | 'advanced' | 'expert' {
    const currentLevel = this.assessCurrentLevel(items)
    
    switch (currentLevel) {
      case 'beginner': return 'intermediate'
      case 'intermediate': return 'advanced'
      case 'advanced': return 'expert'
    }
  }

  private calculateDuration(items: ImprovementItem[]): number {
    return items.reduce((total, item) => {
      const duration = item.estimatedDuration || '2-4周'
      const weeks = parseInt(duration.match(/\d+/)?.[0] || '4')
      return total + weeks
    }, 0)
  }

  private generateMilestones(items: ImprovementItem[]) {
    return items.map((item, index) => ({
      week: (index + 1) * 2,
      title: item.title,
      objectives: [item.description],
      successCriteria: [`完成${item.title}相关练习`, '通过自我评估测试'],
      assessmentMethod: '实践项目 + 同伴review'
    }))
  }

  private aggregateResources(items: ImprovementItem[]) {
    const allResources = items.flatMap(item => item.resources || [])
    return Array.from(new Set(allResources)).map(resource => ({
      type: 'course' as const,
      title: resource,
      priority: 'high' as const
    }));
  }

  private suggestProjects(skill: string, positionType: string) {
    const projectMap: Record<string, any[]> = {
      'algorithm': [
        { name: '实现常用算法库', difficulty: 'medium', timeRequired: '2周', skills: ['算法', '数据结构'] },
        { name: 'LeetCode刷题计划', difficulty: 'easy', timeRequired: '4周', skills: ['编程思维', '算法优化'] }
      ],
      'system-design': [
        { name: '设计微博系统', difficulty: 'hard', timeRequired: '3周', skills: ['架构设计', '数据库设计'] },
        { name: '实现分布式缓存', difficulty: 'medium', timeRequired: '2周', skills: ['系统设计', '性能优化'] }
      ],
      'communication': [
        { name: '技术分享演讲', difficulty: 'easy', timeRequired: '1周', skills: ['表达能力', '知识分享'] },
        { name: '写技术博客', difficulty: 'easy', timeRequired: '2周', skills: ['文字表达', '技术总结'] }
      ]
    }
    
    return projectMap[skill] || [
      { name: `${skill}实践项目`, difficulty: 'medium', timeRequired: '2-3周', skills: [skill] }
    ]
  }
}