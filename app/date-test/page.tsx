'use client'

import { useState, useEffect } from 'react'
import { interviewService } from '../../lib/supabase'
import { formatDateToChinese, debugDate, normalizeDate } from '../../lib/dateUtils'
import { InterviewRecord } from '../../types/interview'

export default function DateTestPage() {
  const [interviews, setInterviews] = useState<InterviewRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadInterviews()
  }, [])

  const loadInterviews = async () => {
    try {
      setLoading(true)
      const data = await interviewService.getAllInterviews()
      console.log('📊 加载到的面试记录:', data)
      setInterviews(data)
    } catch (err) {
      console.error('加载失败:', err)
      setError('加载失败')
    } finally {
      setLoading(false)
    }
  }

  const testDateFormats = () => {
    const testDates = [
      '2024-01-01',
      '2024-01-01T00:00:00.000Z',
      new Date('2024-01-01'),
      new Date(),
      '',
      null,
      undefined
    ]

    console.log('🧪 测试日期格式:')
    testDates.forEach((date, index) => {
      console.log(`${index + 1}. 原始值:`, date)
      console.log(`   类型:`, typeof date)
      console.log(`   调试信息:`, debugDate(date as any))
      console.log(`   中文格式:`, formatDateToChinese(date as any))
      console.log(`   标准化:`, normalizeDate(date as any))
      console.log('---')
    })
  }

  if (loading) {
    return <div className="p-8">加载中...</div>
  }

  if (error) {
    return <div className="p-8 text-red-600">错误: {error}</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">日期处理测试</h1>
      
      <button 
        onClick={testDateFormats}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        测试日期格式
      </button>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">数据库中的面试记录</h2>
        {interviews.length === 0 ? (
          <p className="text-gray-500">暂无面试记录</p>
        ) : (
          <div className="space-y-4">
            {interviews.map(interview => (
              <div key={interview.id} className="border p-4 rounded">
                <h3 className="font-semibold">{interview.company} - {interview.position}</h3>
                <div className="text-sm text-gray-600 mt-2">
                  <p><strong>原始interviewDate:</strong> {String(interview.interviewDate)}</p>
                  <p><strong>类型:</strong> {typeof interview.interviewDate}</p>
                  <p><strong>调试信息:</strong> {debugDate(interview.interviewDate)}</p>
                  <p><strong>中文格式:</strong> {formatDateToChinese(interview.interviewDate)}</p>
                  <p><strong>标准化:</strong> {normalizeDate(interview.interviewDate)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500">
        <p>请打开浏览器控制台查看详细的测试结果</p>
      </div>
    </div>
  )
}
