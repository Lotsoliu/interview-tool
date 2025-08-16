'use client'

import { useState } from 'react'
import StreamingAnalysis from '../../components/StreamingAnalysis'

export default function DemoPage() {
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const startDemo = () => {
    setIsStreaming(true)
    setStreamingContent('')
    
    // 模拟流式输出
    const demoContent = `让我来分析一下这次面试的表现...

首先，让我仔细阅读面试记录，了解具体情况...

第一步：分析面试表现优点
从面试记录来看，我发现以下几个优点：
1. 面试准备充分，对公司和职位有深入了解
2. 回答问题时表达清晰，逻辑性强
3. 态度积极，展现了良好的职业素养

第二步：识别需要改进的地方
通过分析，我发现以下方面需要改进：
1. 技术深度有待提升，某些专业问题回答不够深入
2. 项目经验需要丰富，缺乏大型项目的实践经验
3. 沟通技巧可以改进，在压力下的表达需要提升

第三步：提出具体的改进建议
基于以上分析，我建议：
1. 深入学习相关技术，参加专业培训课程
2. 主动参与更多项目，积累实战经验
3. 练习面试技巧，提升沟通表达能力
4. 建立知识体系，形成系统性的技术认知
5. 定期复盘总结，持续改进提升

第四步：综合评估
整体评分：7.5/10分

总结：这是一次表现良好的面试，展现了扎实的基础和积极的态度。通过针对性的改进，相信下次面试会有更好的表现。

现在让我以JSON格式返回完整的分析结果...`

    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < demoContent.length) {
        setStreamingContent(prev => prev + demoContent[currentIndex])
        currentIndex++
      } else {
        clearInterval(interval)
        // 模拟分析完成
        setTimeout(() => {
          setIsStreaming(false)
        }, 1000)
      }
    }, 50) // 每50ms输出一个字符
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">流式输出演示</h1>
        <p className="text-gray-600 mb-6">
          体验AI面试分析的实时思考过程，了解流式输出的魅力
        </p>
        
        {!isStreaming && (
          <button
            onClick={startDemo}
            className="btn-primary text-lg px-8 py-3"
          >
            开始演示
          </button>
        )}
      </div>

      {/* 流式分析组件 */}
      <StreamingAnalysis
        isVisible={isStreaming}
        content={streamingContent}
      />

      {/* 功能说明 */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🚀</span>
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">实时输出</h3>
          <p className="text-sm text-gray-600">
            逐字显示AI的思考过程，让您看到分析的每个步骤
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-success-100 text-success-600 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">进度可视化</h3>
          <p className="text-sm text-gray-600">
            清晰的步骤指示器和进度条，了解分析进展
          </p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-warning-100 text-warning-600 rounded-lg flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">💡</span>
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">透明分析</h3>
          <p className="text-sm text-gray-600">
            完全透明的AI分析过程，让您了解每个结论的来源
          </p>
        </div>
      </div>

      {/* 技术特点 */}
      <div className="mt-8 card">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">技术特点</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">前端技术</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• React Hooks 状态管理</li>
              <li>• 自定义流式显示组件</li>
              <li>• 实时进度跟踪</li>
              <li>• 响应式设计</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">后端技术</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Next.js API Routes</li>
              <li>• Server-Sent Events (SSE)</li>
              <li>• 流式响应处理</li>
              <li>• 豆包API集成</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
