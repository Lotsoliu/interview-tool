'use client'

import { useState } from 'react'

export default function DebugPage() {
  const [rawResponse, setRawResponse] = useState('')
  const [parsedContent, setParsedContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const debugAPI = async () => {
    setIsLoading(true)
    setRawResponse('')
    setParsedContent('')
    setError('')

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: '调试公司',
          position: '调试职位',
          interviewDate: '2024-01-01',
          interviewProcess: '这是一个调试用的面试记录，用于查看豆包API的原始响应格式。',
          id: 'debug-1',
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
      let allChunks = ''
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        allChunks += chunk
        
        // 显示原始响应
        setRawResponse(prev => prev + chunk)
        
        // 尝试解析并显示内容
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.chunk) {
                setParsedContent(prev => prev + data.chunk)
              }
            } catch (e) {
              console.warn('解析失败:', e)
            }
          }
        }
      }

    } catch (err) {
      console.error('调试失败:', err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">豆包API调试页面</h1>
      
      <div className="mb-6">
        <button
          onClick={debugAPI}
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? '调试中...' : '开始调试'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-medium text-red-800 mb-2">错误信息</h3>
          <pre className="text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">原始响应</h2>
          <div className="bg-gray-50 p-4 rounded-lg min-h-[400px] max-h-[600px] overflow-auto">
            <pre className="text-xs text-gray-800 whitespace-pre-wrap">{rawResponse || '点击按钮开始调试...'}</pre>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">解析后的内容</h2>
          <div className="bg-gray-50 p-4 rounded-lg min-h-[400px] max-h-[600px] overflow-auto">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap">{parsedContent || '等待内容...'}</pre>
          </div>
        </div>
      </div>

      <div className="mt-6 card">
        <h2 className="text-xl font-semibold mb-4">调试说明</h2>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• 这个页面用于查看豆包API的原始响应格式</p>
          <p>• 左侧显示完整的原始响应（包括SSE格式）</p>
          <p>• 右侧显示解析后的AI回复内容</p>
          <p>• 请查看浏览器控制台获取更详细的调试信息</p>
        </div>
      </div>
    </div>
  )
}
