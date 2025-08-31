'use client'

import { useState, useEffect, useRef } from 'react'
import { InterviewRecord } from '../types/interview'
import { analyzeInterview, analyzeInterviewStreamAPI } from '../lib/doubao'
import StreamingAnalysis from './StreamingAnalysis'
import { normalizeDate } from '../lib/dateUtils'
import { smartPrefillService, InterviewType } from '../lib/smartPrefill'
import { ChevronDown, Lightbulb, FileText, Sparkles } from 'lucide-react'

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
  
  // 智能预填充相关状态
  const [companySuggestions, setCompanySuggestions] = useState<string[]>([])
  const [positionSuggestions, setPositionSuggestions] = useState<string[]>([])
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false)
  const [showPositionSuggestions, setShowPositionSuggestions] = useState(false)
  const [detectedInterviewType, setDetectedInterviewType] = useState<InterviewType>('general')
  const [showTemplate, setShowTemplate] = useState(false)
  const [preparationTips, setPreparationTips] = useState<string[]>([])
  
  const companyInputRef = useRef<HTMLInputElement>(null)
  const positionInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // 智能预填充逻辑
    if (name === 'company') {
      setShowCompanySuggestions(value.length > 0)
    } else if (name === 'position') {
      setShowPositionSuggestions(value.length > 0)
    }
  }

  // 选择公司建议
  const handleCompanySelect = (company: string) => {
    setFormData(prev => ({ ...prev, company }))
    setShowCompanySuggestions(false)
    smartPrefillService.updateSuggestions(company, formData.position)
  }

  // 选择职位建议
  const handlePositionSelect = (position: string) => {
    setFormData(prev => ({ ...prev, position }))
    setShowPositionSuggestions(false)
    smartPrefillService.updateSuggestions(formData.company, position)
  }

  // 使用模板
  const handleUseTemplate = () => {
    const template = smartPrefillService.getTemplateByType(detectedInterviewType)
    setFormData(prev => ({ 
      ...prev, 
      interviewProcess: prev.interviewProcess + template 
    }))
    setShowTemplate(false)
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
        <div className="relative" ref={companyInputRef}>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            公司名称 *
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            onFocus={() => setShowCompanySuggestions(true)}
            className="input-field"
            placeholder="请输入公司名称"
            required
          />
          {showCompanySuggestions && companySuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {companySuggestions
                .filter(company => company.toLowerCase().includes(formData.company.toLowerCase()))
                .slice(0, 8)
                .map((company, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleCompanySelect(company)}
                  className="w-full px-4 py-2 text-left hover:bg-blue-50 hover:text-blue-700 border-b border-gray-100 last:border-b-0"
                >
                  {company}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={positionInputRef}>
          <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
            应聘职位 *
            {detectedInterviewType !== 'general' && (
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                {detectedInterviewType === 'technical' && '💻 技术岗位'}
                {detectedInterviewType === 'product' && '📦 产品岗位'}
                {detectedInterviewType === 'business' && '💼 业务岗位'}
                {detectedInterviewType === 'design' && '🎨 设计岗位'}
                {detectedInterviewType === 'hr' && '👥 HR岗位'}
              </span>
            )}
          </label>
          <input
            type="text"
            id="position"
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            onFocus={() => setShowPositionSuggestions(true)}
            className="input-field"
            placeholder="请输入应聘职位"
            required
          />
          {showPositionSuggestions && positionSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {positionSuggestions
                .filter(position => position.toLowerCase().includes(formData.position.toLowerCase()))
                .slice(0, 8)
                .map((position, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handlePositionSelect(position)}
                  className="w-full px-4 py-2 text-left hover:bg-blue-50 hover:text-blue-700 border-b border-gray-100 last:border-b-0"
                >
                  {position}
                </button>
              ))}
            </div>
          )}
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
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="interviewProcess" className="block text-sm font-medium text-gray-700">
              面试过程记录 *
            </label>
            <div className="flex space-x-2">
              {detectedInterviewType !== 'general' && (
                <button
                  type="button"
                  onClick={() => setShowTemplate(!showTemplate)}
                  className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  <FileText size={14} />
                  <span>使用模板</span>
                </button>
              )}
              {preparationTips.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowTemplate(!showTemplate)}
                  className="flex items-center space-x-1 text-xs text-green-600 hover:text-green-700"
                >
                  <Lightbulb size={14} />
                  <span>准备建议</span>
                </button>
              )}
            </div>
          </div>
          
          {/* 模板和建议面板 */}
          {showTemplate && (
            <div className="mb-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 面试模板 */}
                {detectedInterviewType !== 'general' && (
                  <div>
                    <h4 className="flex items-center text-sm font-medium text-blue-900 mb-2">
                      <FileText size={16} className="mr-1" />
                      {detectedInterviewType === 'technical' && '技术面试模板'}
                      {detectedInterviewType === 'product' && '产品面试模板'}
                      {detectedInterviewType === 'business' && '业务面试模板'}
                      {detectedInterviewType === 'design' && '设计面试模板'}
                      {detectedInterviewType === 'hr' && 'HR面试模板'}
                    </h4>
                    <p className="text-xs text-blue-700 mb-2">使用结构化模板记录面试过程</p>
                    <button
                      type="button"
                      onClick={handleUseTemplate}
                      className="w-full px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      添加模板到输入框
                    </button>
                  </div>
                )}
                
                {/* 准备建议 */}
                {preparationTips.length > 0 && (
                  <div>
                    <h4 className="flex items-center text-sm font-medium text-green-900 mb-2">
                      <Lightbulb size={16} className="mr-1" />
                      面试准备建议
                    </h4>
                    <div className="max-h-32 overflow-y-auto">
                      <ul className="space-y-1">
                        {preparationTips.slice(0, 5).map((tip, index) => (
                          <li key={index} className="text-xs text-green-700 flex items-start">
                            <span className="text-green-500 mr-1">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
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
