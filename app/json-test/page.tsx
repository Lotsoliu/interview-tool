'use client'

import { useState } from 'react'

export default function JSONTestPage() {
  const [testContent, setTestContent] = useState('')
  const [extractedJSON, setExtractedJSON] = useState('')
  const [parseResult, setParseResult] = useState('')

  const testJSONExtraction = () => {
    const content = testContent.trim()
    if (!content) return

    setExtractedJSON('')
    setParseResult('')

    // 策略1：使用正则表达式匹配最外层的JSON
    let jsonContent = null
    
    const jsonMatch1 = content.match(/\{[\s\S]*\}/)
    if (jsonMatch1) {
      jsonContent = jsonMatch1[0]
      setExtractedJSON(`策略1成功:\n${jsonContent}`)
    }
    
    // 策略2：如果策略1失败，尝试找到最后一个完整的JSON对象
    if (!jsonContent) {
      const lastBraceIndex = content.lastIndexOf('}')
      if (lastBraceIndex !== -1) {
        let braceCount = 0
        let startIndex = -1
        
        for (let i = lastBraceIndex; i >= 0; i--) {
          if (content[i] === '}') {
            braceCount++
          } else if (content[i] === '{') {
            braceCount--
            if (braceCount === 0) {
              startIndex = i
              break
            }
          }
        }
        
        if (startIndex !== -1) {
          jsonContent = content.substring(startIndex, lastBraceIndex + 1)
          setExtractedJSON(`策略2成功:\n${jsonContent}`)
        }
      }
    }

    // 尝试解析JSON
    if (jsonContent) {
      try {
        const parsed = JSON.parse(jsonContent)
        setParseResult(`✅ JSON解析成功:\n${JSON.stringify(parsed, null, 2)}`)
      } catch (error) {
        setParseResult(`❌ JSON解析失败:\n${error}`)
      }
    } else {
      setExtractedJSON('❌ 未找到JSON内容')
      setParseResult('无法提取JSON内容')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">JSON解析测试</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">测试内容</h2>
          <textarea
            value={testContent}
            onChange={(e) => setTestContent(e.target.value)}
            className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm"
            placeholder="粘贴包含JSON的内容..."
          />
          <button
            onClick={testJSONExtraction}
            className="mt-3 btn-primary"
          >
            测试JSON提取
          </button>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">提取结果</h2>
          <div className="bg-gray-50 p-3 rounded-lg min-h-[200px]">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap">{extractedJSON || '等待测试...'}</pre>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">解析结果</h2>
        <div className="bg-gray-50 p-3 rounded-lg min-h-[200px]">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap">{parseResult || '等待测试...'}</pre>
        </div>
      </div>

      <div className="mt-6 card">
        <h2 className="text-xl font-semibold mb-4">使用说明</h2>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• 在左侧文本框中粘贴包含JSON的内容</p>
          <p>• 点击"测试JSON提取"按钮</p>
          <p>• 查看提取和解析结果</p>
          <p>• 这个工具可以帮助调试豆包API的JSON解析问题</p>
        </div>
      </div>
    </div>
  )
}
