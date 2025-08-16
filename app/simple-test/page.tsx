'use client'

import { useState } from 'react'

export default function SimpleTestPage() {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const testSimpleStreaming = async () => {
    setIsLoading(true)
    setContent('')
    setError('')

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: '测试公司',
          position: '前端工程师',
          interviewDate: '2024-01-01',
          interviewProcess: '面试过程很顺利，技术问题回答得不错，但项目经验需要提升。',
          id: 'test-simple',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API调用失败: ${response.status} - ${errorText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法获取响应体读取器')
      }

      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        console.log('收到数据块:', chunk)
        
        // 解析SSE格式
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.chunk) {
                setContent(prev => prev + data.chunk)
              }
            } catch (e) {
              console.warn('解析失败:', e)
            }
          }
        }
      }

    } catch (err) {
      console.error('测试失败:', err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">简化流式测试</h1>
      
      <div className="mb-6">
        <button
          onClick={testSimpleStreaming}
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? '测试中...' : '开始测试'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-medium text-red-800 mb-2">错误信息</h3>
          <pre className="text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">流式内容</h2>
        <div className="bg-gray-50 p-4 rounded-lg min-h-[200px]">
          {content ? (
            <pre className="text-sm text-gray-800 whitespace-pre-wrap">{content}</pre>
          ) : (
            <p className="text-gray-500">点击按钮开始测试...</p>
          )}
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>这个页面用于测试流式API的基本功能，不包含复杂的UI组件。</p>
      </div>
    </div>
  )
}
