'use client'

import { useState, useEffect, useRef } from 'react'
import { Brain, Lightbulb, Target, TrendingUp, CheckCircle } from 'lucide-react'

interface StreamingAnalysisProps {
  isVisible: boolean
  content: string
  onComplete?: () => void
}

export default function StreamingAnalysis({ isVisible, content, onComplete }: StreamingAnalysisProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [stepProgress, setStepProgress] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  
  const steps = [
    { icon: Brain, title: '分析面试表现', description: '正在分析面试过程中的优点和不足' },
    { icon: Lightbulb, title: '识别改进点', description: '正在识别需要改进的具体方面' },
    { icon: Target, title: '制定改进计划', description: '正在制定具体的改进建议和行动计划' },
    { icon: TrendingUp, title: '综合评估', description: '正在给出整体评分和总结建议' }
  ]

  // 自动滚动到底部
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [content])

  // 根据内容分析当前步骤
  useEffect(() => {
    if (!content) return

    let newStep = 0
    let progress = 0

    if (content.includes('优点') || content.includes('优势')) {
      newStep = 0
      progress = Math.min(100, (content.length / 200) * 100)
    }
    
    if (content.includes('改进') || content.includes('不足') || content.includes('缺点')) {
      newStep = 1
      progress = Math.min(100, ((content.length - 200) / 300) * 100)
    }
    
    if (content.includes('建议') || content.includes('计划') || content.includes('行动')) {
      newStep = 2
      progress = Math.min(100, ((content.length - 500) / 400) * 100)
    }
    
    if (content.includes('评分') || content.includes('总结') || content.includes('整体')) {
      newStep = 3
      progress = Math.min(100, ((content.length - 900) / 300) * 100)
    }

    setCurrentStep(newStep)
    setStepProgress(Math.max(0, Math.min(100, progress)))
  }, [content])

  if (!isVisible) return null

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
        <h4 className="text-lg font-semibold text-gray-800">AI智能分析中</h4>
      </div>

      {/* 步骤指示器 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          const isPending = index > currentStep
          
          return (
            <div key={index} className="text-center">
              <div className={`relative mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                isCompleted ? 'bg-success-100 text-success-600' :
                isActive ? 'bg-primary-100 text-primary-600' :
                'bg-gray-100 text-gray-400'
              }`}>
                {isCompleted ? (
                  <CheckCircle size={20} />
                ) : (
                  <Icon size={20} />
                )}
                {isActive && (
                  <div className="absolute inset-0 rounded-full border-2 border-primary-500 animate-ping"></div>
                )}
              </div>
              <h5 className={`text-sm font-medium ${
                isCompleted ? 'text-success-700' :
                isActive ? 'text-primary-700' :
                'text-gray-500'
              }`}>
                {step.title}
              </h5>
              <p className="text-xs text-gray-500 mt-1 hidden md:block">
                {step.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* 当前步骤进度 */}
      {currentStep < steps.length && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>当前步骤：{steps[currentStep].title}</span>
            <span>{Math.round(stepProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${stepProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 流式内容显示 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">实时分析过程</span>
        </div>
        <div 
          ref={contentRef}
          className="max-h-80 overflow-y-auto bg-gray-50 rounded p-3"
        >
          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
            {content || '正在等待AI响应...'}
          </pre>
          {content && (
            <div className="inline-block w-2 h-4 bg-primary-500 ml-1 animate-pulse"></div>
          )}
        </div>
      </div>

      {/* 提示信息 */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          AI正在逐步分析您的面试表现，请耐心等待...
        </p>
        <p className="text-xs text-gray-500 mt-1">
          流式输出让您能够看到AI的思考过程，获得更透明的分析结果
        </p>
      </div>
    </div>
  )
}
