'use client'

import { useState } from 'react'
import { InterviewRecord } from '../types/interview'
import { analyzeInterview, analyzeInterviewStreamAPI } from '../lib/doubao'
import StreamingAnalysis from './StreamingAnalysis'
import { normalizeDate } from '../lib/dateUtils'

interface InterviewFormProps {
  onSave: (interview: InterviewRecord) => void
  onCancel: () => void
}

export default function InterviewForm({ onSave, onCancel }: InterviewFormProps) {
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    interviewDate: '',
    interviewProcess: ''
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [streamingContent, setStreamingContent] = useState('')
  const [showStreaming, setShowStreaming] = useState(false)
  const [useStreaming, setUseStreaming] = useState(true)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.company || !formData.position || !formData.interviewDate || !formData.interviewProcess) {
      setError('请填写所有必填字段')
      return
    }

    setIsAnalyzing(true)
    setError('')
    setStreamingContent('')
    setShowStreaming(false)

    try {
      // 使用日期工具函数标准化日期格式
      const normalizedDate = normalizeDate(formData.interviewDate)
      
      const interview: InterviewRecord = {
        id: `interview-${Date.now()}`,
        ...formData,
        interviewDate: normalizedDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      console.log('🚀 开始分析面试记录:', interview)

      if (useStreaming) {
        // 使用API路由流式分析
        console.log('📡 启用流式分析...')
        setShowStreaming(true)
        
        await analyzeInterviewStreamAPI(
          interview,
          (chunk) => {
            console.log('📦 收到数据块:', chunk)
            setStreamingContent(prev => prev + chunk)
          },
          (analysis) => {
            console.log('✅ 分析完成:', analysis)
            interview.analysis = analysis
            setShowStreaming(false)
            setIsAnalyzing(false)
            onSave(interview)
          },
          (errorMsg) => {
            console.error('❌ 流式分析错误:', errorMsg)
            setError(errorMsg)
            setShowStreaming(false)
            setIsAnalyzing(false)
          }
        )
      } else {
        // 使用普通分析
        console.log('📡 使用普通分析...')
        const analysis = await analyzeInterview(interview)
        console.log('✅ 普通分析完成:', analysis)
        interview.analysis = analysis
        setIsAnalyzing(false)
        onSave(interview)
      }
    } catch (err) {
      console.error('❌ 表单提交错误:', err)
      setError(err instanceof Error ? err.message : '分析失败，请稍后重试')
      setIsAnalyzing(false)
    }
  }

  const testStreamingAPI = async () => {
    setIsAnalyzing(true) // Changed from setIsLoading to setIsAnalyzing
    setError('')
    setStreamingContent('')
    setShowStreaming(true)
    
    console.log('🧪 开始测试流式API...')
    
    try {
      const testInterview: InterviewRecord = {
        id: 'test-' + Date.now(),
        company: '测试公司',
        position: '测试职位',
        interviewDate: '2024-01-01',
        interviewProcess: '这是一个测试面试记录，用于验证流式输出功能。面试过程中我表现良好，但技术深度有待提升。',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await analyzeInterviewStreamAPI(
        testInterview,
        (chunk) => {
          console.log('📦 测试收到数据块:', chunk)
          setStreamingContent(prev => prev + chunk)
        },
        (analysis) => {
          console.log('✅ 测试分析完成:', analysis)
          setShowStreaming(false)
          setIsAnalyzing(false)
          setError('')
          // 不保存测试数据，只显示成功消息
        },
        (errorMsg) => {
          console.error('❌ 测试流式分析错误:', errorMsg)
          setError('测试失败: ' + errorMsg)
          setShowStreaming(false)
          setIsAnalyzing(false)
        }
      )
    } catch (err) {
      console.error('❌ 测试异常:', err)
      setError('测试异常: ' + (err instanceof Error ? err.message : String(err)))
      setShowStreaming(false)
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-4">添加面试记录</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            公司名称 *
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className="input-field"
            placeholder="请输入公司名称"
            required
          />
        </div>

        <div>
          <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
            应聘职位 *
          </label>
          <input
            type="text"
            id="position"
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            className="input-field"
            placeholder="请输入应聘职位"
            required
          />
        </div>

        <div>
          <label htmlFor="interviewDate" className="block text-sm font-medium text-gray-700 mb-1">
            面试时间 *
          </label>
          <input
            type="date"
            id="interviewDate"
            name="interviewDate"
            value={formData.interviewDate}
            onChange={handleInputChange}
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="interviewProcess" className="block text-sm font-medium text-gray-700 mb-1">
            面试过程记录 *
          </label>
          <textarea
            id="interviewProcess"
            name="interviewProcess"
            value={formData.interviewProcess}
            onChange={handleInputChange}
            className="input-field min-h-[120px] resize-y"
            placeholder="请详细记录面试过程，包括面试官的问题、你的回答、面试氛围等..."
            required
          />
        </div>

        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <input
            type="checkbox"
            id="useStreaming"
            checked={useStreaming}
            onChange={(e) => setUseStreaming(e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <div>
            <label htmlFor="useStreaming" className="text-sm font-medium text-blue-800">
              启用流式输出
            </label>
            <p className="text-xs text-blue-600 mt-1">
              显示AI的思考过程，让您了解分析是如何进行的
            </p>
          </div>
        </div>

        {error && (
          <div className="text-danger-600 text-sm bg-danger-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 流式分析组件 */}
        <StreamingAnalysis
          isVisible={showStreaming}
          content={streamingContent}
        />

        {/* 状态显示 */}
        {isAnalyzing && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-700">
                {showStreaming ? '正在分析中...' : '处理中...'}
              </span>
            </div>
            {streamingContent && (
              <p className="text-xs text-blue-600 mt-1">
                已接收 {streamingContent.length} 个字符
              </p>
            )}
          </div>
        )}

        <div className="flex justify-between items-center pt-4">
          {/* <div className="flex space-x-3">
            <button
              type="button"
              onClick={testStreamingAPI}
              className="btn-secondary"
              disabled={isAnalyzing}
            >
              测试流式API
            </button>
          </div> */}
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={isAnalyzing}
            >
              取消
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? '分析中...' : '保存并分析'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
