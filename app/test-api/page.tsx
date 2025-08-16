'use client'

import { useState } from 'react'

export default function TestAPIPage() {
  const [testResult, setTestResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const testDoubaoAPI = async () => {
    setIsLoading(true)
    setTestResult('开始测试豆包API...\n')
    
    try {
      // 测试直接调用豆包API
      setTestResult(prev => prev + '📡 测试直接调用豆包API...\n')
      
      const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer a96ad080-652f-4a6d-aa22-616cede91d37',
        },
        body: JSON.stringify({
          model: 'doubao-seed-1-6-thinking-250715',
          messages: [
            {
              role: 'user',
              content: '请简单回复"测试成功"'
            }
          ]
        })
      })

      setTestResult(prev => prev + `📥 响应状态: ${response.status} ${response.statusText}\n`)
      
      if (response.ok) {
        const data = await response.json()
        setTestResult(prev => prev + `✅ 直接API调用成功:\n${JSON.stringify(data, null, 2)}\n`)
      } else {
        const errorText = await response.text()
        setTestResult(prev => prev + `❌ 直接API调用失败:\n${errorText}\n`)
      }
    } catch (error) {
      setTestResult(prev => prev + `❌ 直接API调用异常: ${error}\n`)
    }

    try {
      // 测试我们的API路由
      setTestResult(prev => prev + '\n📡 测试我们的API路由...\n')
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: '测试公司',
          position: '测试职位',
          interviewDate: '2024-01-01',
          interviewProcess: '这是一个测试面试记录',
          id: 'test-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      })

      setTestResult(prev => prev + `📥 API路由响应状态: ${response.status} ${response.statusText}\n`)
      
      if (response.ok) {
        setTestResult(prev => prev + '✅ API路由调用成功，开始读取流式数据...\n')
        
        const reader = response.body?.getReader()
        if (reader) {
          const decoder = new TextDecoder()
          let chunkCount = 0
          
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            const chunk = decoder.decode(value, { stream: true })
            chunkCount++
            setTestResult(prev => prev + `📦 数据块${chunkCount}: ${chunk}\n`)
          }
          
          setTestResult(prev => prev + `✅ 流式读取完成，共${chunkCount}个数据块\n`)
        } else {
          setTestResult(prev => prev + '❌ 无法获取响应体读取器\n')
        }
      } else {
        const errorText = await response.text()
        setTestResult(prev => prev + `❌ API路由调用失败:\n${errorText}\n`)
      }
    } catch (error) {
      setTestResult(prev => prev + `❌ API路由调用异常: ${error}\n`)
    }

    setIsLoading(false)
  }

  const testStreamingAPI = async () => {
    setIsLoading(true)
    setTestResult('开始测试流式API...\n')
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: '测试公司',
          position: '测试职位',
          interviewDate: '2024-01-01',
          interviewProcess: '这是一个测试面试记录，用于验证流式输出功能是否正常工作。',
          id: 'test-2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      })

      if (response.ok) {
        setTestResult(prev => prev + '✅ 流式API调用成功\n')
        
        // 使用EventSource方式读取
        const reader = response.body?.getReader()
        if (reader) {
          const decoder = new TextDecoder()
          
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            
            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6))
                  if (data.chunk) {
                    setTestResult(prev => prev + `📝 AI回复: ${data.chunk}\n`)
                  }
                } catch (e) {
                  // 忽略解析错误
                }
              }
            }
          }
        }
      } else {
        const errorText = await response.text()
        setTestResult(prev => prev + `❌ 流式API调用失败: ${errorText}\n`)
      }
    } catch (error) {
      setTestResult(prev => prev + `❌ 流式API调用异常: ${error}\n`)
    }

    setIsLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">豆包API测试页面</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testDoubaoAPI}
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading ? '测试中...' : '测试豆包API'}
        </button>
        
        <button
          onClick={testStreamingAPI}
          disabled={isLoading}
          className="btn-secondary ml-4"
        >
          {isLoading ? '测试中...' : '测试流式API'}
        </button>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">测试结果</h2>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-sm">
          {testResult || '点击按钮开始测试...'}
        </pre>
      </div>

      <div className="mt-6 card">
        <h2 className="text-xl font-semibold mb-4">环境信息</h2>
        <div className="space-y-2 text-sm">
          <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
          <p><strong>NEXT_PUBLIC_DOUBAO_API_URL:</strong> {process.env.NEXT_PUBLIC_DOUBAO_API_URL || '未设置'}</p>
          <p><strong>NEXT_PUBLIC_DOUBAO_API_KEY:</strong> {process.env.NEXT_PUBLIC_DOUBAO_API_KEY ? '已设置' : '未设置'}</p>
        </div>
      </div>
    </div>
  )
}
