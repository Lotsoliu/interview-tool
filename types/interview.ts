export interface InterviewRecord {
  id: string
  company: string
  interviewDate: string
  position: string
  interviewProcess: string
  analysis?: InterviewAnalysis
  createdAt: string
  updatedAt: string
}

export interface InterviewAnalysis {
  strengths: string[]
  weaknesses: string[]
  improvements: ImprovementItem[]
  overallScore: number
  summary: string
  scoreBreakdown?: {
    technical?: number
    softSkills?: number
    fitMatch?: number
    business?: number
    product?: number
  }
  positionType?: 'technical' | 'product' | 'business' | 'design' | 'general'
}

export interface ImprovementItem {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  dueDate?: string
  estimatedDuration?: string // 预计完成时间（周）
  resources?: string[] // 推荐学习资源
  milestones?: string[] // 里程碑
  tags?: string[] // 标签，如 'algorithm', 'system-design', 'communication'
  createdAt?: string
  updatedAt?: string
}

// 学习路径接口
export interface LearningPath {
  skill: string
  currentLevel: 'beginner' | 'intermediate' | 'advanced'
  targetLevel: 'intermediate' | 'advanced' | 'expert'
  estimatedDuration: number // 周
  milestones: LearningMilestone[]
  resources: LearningResource[]
  practiceProjects: PracticeProject[]
}

export interface LearningMilestone {
  week: number
  title: string
  objectives: string[]
  successCriteria: string[]
  assessmentMethod: string
}

export interface LearningResource {
  type: 'book' | 'course' | 'video' | 'article' | 'practice'
  title: string
  url?: string
  platform?: string
  priority: 'high' | 'medium' | 'low'
  estimatedTime?: string
}

export interface PracticeProject {
  name: string
  description?: string
  difficulty: 'easy' | 'medium' | 'hard'
  timeRequired: string
  skills: string[]
  githubUrl?: string
}
