'use client'

import { useState, useEffect } from 'react'
import InterviewForm from '../components/InterviewForm'
import InterviewList from '../components/InterviewList'
import { InterviewRecord } from '../types/interview'
import { interviewService } from '../lib/supabase'
import Link from 'next/link'

export default function HomePage() {
  const [interviews, setInterviews] = useState<InterviewRecord[]>([])
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')


  // 加载面试记录
  useEffect(() => {
    loadInterviews()
  }, [])



  const loadInterviews = async () => {
    try {
      setIsLoading(true)
      const data = await interviewService.getAllInterviews()
      setInterviews(data)
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
        setInterviews([savedInterview, ...interviews])
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
        setInterviews(interviews.map(interview => 
          interview.id === updatedInterview.id ? savedInterview : interview
        ))
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
        setInterviews(interviews.filter(interview => interview.id !== id))
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">面试记录</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            添加面试记录
          </button>
        </div>
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
