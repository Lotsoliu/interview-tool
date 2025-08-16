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
}

export interface ImprovementItem {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  dueDate?: string
}
