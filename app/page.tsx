'use client'

import { useState, useEffect } from 'react'
import InterviewForm from '../components/InterviewForm'
import InterviewList from '../components/InterviewList'
import { InterviewRecord } from '../types/interview'
import { interviewService } from '../lib/supabase'
import Link from 'next/link'
import { CheckCircle, Circle, TrendingUp, Calendar, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const [interviews, setInterviews] = useState<InterviewRecord[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [todoStats, setTodoStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    highPriority: 0
  })
  const [error, setError] = useState('')

  // 计算待办统计
  const calculateTodoStats = (interviewList: InterviewRecord[]) => {
    let total = 0
    let completed = 0
    let pending = 0
    let highPriority = 0

    interviewList.forEach(interview => {
      if (interview.analysis?.improvements) {
        interview.analysis.improvements.forEach(improvement => {
          total++
          if (improvement.completed) {
            completed++
          } else {
            pending++
            if (improvement.priority === 'high') {
              highPriority++
            }
          }
        })
      }
    })

    setTodoStats({ total, completed, pending, highPriority })
  }


  // 加载面试记录
  useEffect(() => {
    loadInterviews()
  }, [])



  const loadInterviews = async () => {
    try {
      setIsLoading(true)
      const data = await interviewService.getAllInterviews()
      setInterviews(data)
      calculateTodoStats(data)
    } catch (err) {
      console.error('加载面试记录失败:', err)
      setError('加载面试记录失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveInterview = async (interview: InterviewRecord) => {
    try {
      const savedInterview = await interviewService.createInterview(interview)
      if (savedInterview) {
        const updatedInterviews = [savedInterview, ...interviews]
        setInterviews(updatedInterviews)
        calculateTodoStats(updatedInterviews)
        setShowForm(false)
        setError('')
      } else {
        setError('保存面试记录失败')
      }
    } catch (err) {
      console.error('保存面试记录失败:', err)
      setError('保存面试记录失败')
    }
  }

  const handleUpdateInterview = async (updatedInterview: InterviewRecord) => {
    try {
      const savedInterview = await interviewService.updateInterview(updatedInterview)
      if (savedInterview) {
        const updatedInterviews = interviews.map(interview => 
          interview.id === updatedInterview.id ? savedInterview : interview
        )
        setInterviews(updatedInterviews)
        calculateTodoStats(updatedInterviews)
        setError('')
      } else {
        setError('更新面试记录失败')
      }
    } catch (err) {
      console.error('更新面试记录失败:', err)
      setError('更新面试记录失败')
    }
  }

  const handleDeleteInterview = async (id: string) => {
    try {
      const success = await interviewService.deleteInterview(id)
      if (success) {
        const updatedInterviews = interviews.filter(interview => interview.id !== id)
        setInterviews(updatedInterviews)
        calculateTodoStats(updatedInterviews)
        setError('')
      } else {
        setError('删除面试记录失败')
      }
    } catch (err) {
      console.error('删除面试记录失败:', err)
      setError('删除面试记录失败')
    }
  }

    return (
    <div className="max-w-6xl mx-auto">
      {/* 头部导航和统计 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">面试复盘助手</h1>
            <p className="text-gray-600">专业的AI面试分析，让每次面试都成为成长的机会</p>
          </div>
          <div className="flex space-x-3">
            <Link href="/todos" className="btn-secondary flex items-center space-x-2">
              <Calendar size={16} />
              <span>待办中心</span>
              {todoStats.pending > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {todoStats.pending}
                </span>
              )}
            </Link>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              添加面试记录
            </button>
          </div>
        </div>

        {/* 待办统计卡片 */}
        {todoStats.total > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">📊 成长进度概览</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-gray-700">已完成: <strong>{todoStats.completed}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Circle size={16} className="text-orange-600" />
                    <span className="text-gray-700">待处理: <strong>{todoStats.pending}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp size={16} className="text-red-600" />
                    <span className="text-gray-700">高优先级: <strong>{todoStats.highPriority}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-blue-600" />
                    <span className="text-gray-700">总计: <strong>{todoStats.total}</strong></span>
                  </div>
                </div>
              </div>
              <Link 
                href="/todos" 
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>查看详情</span>
                <ArrowRight size={16} />
              </Link>
            </div>
            
            {/* 进度条 */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-blue-700 mb-1">
                <span>完成进度</span>
                <span>{todoStats.total > 0 ? Math.round((todoStats.completed / todoStats.total) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${todoStats.total > 0 ? (todoStats.completed / todoStats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">面试记录</h2>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-red-600">❌</span>
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">正在加载面试记录...</p>
        </div>
      )}

      {showForm && (
        <div className="mb-8">
          <InterviewForm 
            onSave={handleSaveInterview}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <InterviewList
        interviews={interviews}
        onUpdate={handleUpdateInterview}
        onDelete={handleDeleteInterview}
      />
    </div>
  )
}
