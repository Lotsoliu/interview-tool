import { createClient } from '@supabase/supabase-js'
import { InterviewRecord } from '../types/interview'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 面试记录相关的数据库操作
export const interviewService = {
  // 获取所有面试记录
  async getAllInterviews(): Promise<InterviewRecord[]> {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('获取面试记录失败:', error)
        throw error
      }

      // 转换数据库格式为前端格式
      return (data || []).map(item => ({
        id: item.id,
        company: item.company,
        position: item.position,
        interviewDate: item.interview_date,
        interviewProcess: item.interview_process,
        analysis: item.analysis,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }))
    } catch (error) {
      console.error('获取面试记录异常:', error)
      return []
    }
  },

  // 根据ID获取面试记录
  async getInterviewById(id: string): Promise<InterviewRecord | null> {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('获取面试记录失败:', error)
        return null
      }

      // 转换数据库格式为前端格式
      return {
        id: data.id,
        company: data.company,
        position: data.position,
        interviewDate: data.interview_date,
        interviewProcess: data.interview_process,
        analysis: data.analysis,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.error('获取面试记录异常:', error)
      return null
    }
  },

  // 创建新的面试记录
  async createInterview(interview: InterviewRecord): Promise<InterviewRecord | null> {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .insert([{
          id: interview.id,
          company: interview.company,
          position: interview.position,
          interview_date: interview.interviewDate,
          interview_process: interview.interviewProcess,
          analysis: interview.analysis,
          created_at: interview.createdAt,
          updated_at: interview.updatedAt
        }])
        .select()
        .single()

      if (error) {
        console.error('创建面试记录失败:', error)
        throw error
      }

      // 转换回前端格式
      return {
        id: data.id,
        company: data.company,
        position: data.position,
        interviewDate: data.interview_date,
        interviewProcess: data.interview_process,
        analysis: data.analysis,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.error('创建面试记录异常:', error)
      return null
    }
  },

  // 更新面试记录
  async updateInterview(interview: InterviewRecord): Promise<InterviewRecord | null> {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .update({
          company: interview.company,
          position: interview.position,
          interview_date: interview.interviewDate,
          interview_process: interview.interviewProcess,
          analysis: interview.analysis,
          updated_at: new Date().toISOString()
        })
        .eq('id', interview.id)
        .select()
        .single()

      if (error) {
        console.error('更新面试记录失败:', error)
        throw error
      }

      // 转换回前端格式
      return {
        id: data.id,
        company: data.company,
        position: data.position,
        interviewDate: data.interview_date,
        interviewProcess: data.interview_process,
        analysis: data.analysis,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.error('更新面试记录异常:', error)
      return null
    }
  },

  // 删除面试记录
  async deleteInterview(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('interviews')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('删除面试记录失败:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('删除面试记录异常:', error)
      return false
    }
  },

  // 搜索面试记录
  async searchInterviews(query: string): Promise<InterviewRecord[]> {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .or(`company.ilike.%${query}%,position.ilike.%${query}%,interview_process.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('搜索面试记录失败:', error)
        throw error
      }

      // 转换数据库格式为前端格式
      return (data || []).map(item => ({
        id: item.id,
        company: item.company,
        position: item.position,
        interviewDate: item.interview_date,
        interviewProcess: item.interview_process,
        analysis: item.analysis,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }))
    } catch (error) {
      console.error('搜索面试记录异常:', error)
      return []
    }
  }
}

// 改进建议相关的数据库操作
export const improvementService = {
  // 更新改进建议的完成状态
  async updateImprovementStatus(interviewId: string, improvementId: string, completed: boolean): Promise<boolean> {
    try {
      // 先获取面试记录
      const interview = await interviewService.getInterviewById(interviewId)
      if (!interview || !interview.analysis) return false

      // 更新改进建议状态
      const updatedImprovements = interview.analysis.improvements.map(item =>
        item.id === improvementId ? { ...item, completed } : item
      )

      // 更新整个分析结果
      const updatedInterview = {
        ...interview,
        analysis: {
          ...interview.analysis,
          improvements: updatedImprovements
        }
      }

      const result = await interviewService.updateInterview(updatedInterview)
      return result !== null
    } catch (error) {
      console.error('更新改进建议状态失败:', error)
      return false
    }
  }
}
