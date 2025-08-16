'use client'

import { useState } from 'react'
import { interviewService } from '../../lib/supabase'

export default function TestConnectionPage() {
  const [testResults, setTestResults] = useState<{
    doubao: string
    supabase: string
    database: string
  }>({
    doubao: '未测试',
    supabase: '未测试',
    database: '未测试'
  })
  const [isTesting, setIsTesting] = useState(false)

  const testDoubaoAPI = async () => {
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
          interviewProcess: '这是一个测试面试记录，用于验证API连接。'
        })
      })

      if (response.ok) {
        setTestResults(prev => ({ ...prev, doubao: '✅ 连接成功' }))
      } else {
        const errorText = await response.text()
        setTestResults(prev => ({ ...prev, doubao: `❌ 连接失败: ${response.status} ${errorText}` }))
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, doubao: `❌ 连接错误: ${error}` }))
    }
  }
    const testSupabaseConnection = async () => {
        try {
        // 测试Supabase客户端连接
        const data = await interviewService.getAllInterviews()
        
        // 如果没有抛出错误且数据存在，说明连接成功
        if (data !== undefined) {
            setTestResults(prev => ({ ...prev, supabase: '✅ 连接成功' }))
        } else {
            setTestResults(prev => ({ ...prev, supabase: '❌ 未获取到数据' }))
        }
        } catch (error) {
        // 捕获 getAllInterviews() 抛出的错误
        const errorMessage = error instanceof Error ? error.message : String(error)
        setTestResults(prev => ({ ...prev, supabase: `❌ 连接错误: ${errorMessage}` }))
        }
    }

  const testDatabaseOperations = async () => {
    try {
      // 测试数据库操作
      const testInterview = {
        id: `test-${Date.now()}`,
        company: '测试公司',
        position: '测试职位',
        interviewDate: '2024-01-01',
        interviewProcess: '测试面试过程',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // 创建测试记录
      const created = await interviewService.createInterview(testInterview)
      if (!created) {
        setTestResults(prev => ({ ...prev, database: '❌ 创建记录失败' }))
        return
      }

      // 读取记录
      const read = await interviewService.getInterviewById(testInterview.id)
      if (!read) {
        setTestResults(prev => ({ ...prev, database: '❌ 读取记录失败' }))
        return
      }

      // 删除测试记录
      const deleted = await interviewService.deleteInterview(testInterview.id)
      if (!deleted) {
        setTestResults(prev => ({ ...prev, database: '❌ 删除记录失败' }))
        return
      }

      setTestResults(prev => ({ ...prev, database: '✅ 所有操作成功' }))
    } catch (error) {
      setTestResults(prev => ({ ...prev, database: `❌ 数据库操作错误: ${error}` }))
    }
  }

  const runAllTests = async () => {
    setIsTesting(true)
    setTestResults({
      doubao: '测试中...',
      supabase: '测试中...',
      database: '测试中...'
    })

    // 并行运行所有测试
    await Promise.all([
      testDoubaoAPI(),
      testSupabaseConnection(),
      testDatabaseOperations()
    ])

    setIsTesting(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">连接测试页面</h1>
      
      <div className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">测试结果</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">豆包API连接:</span>
              <span className={testResults.doubao.includes('✅') ? 'text-success-600' : testResults.doubao.includes('❌') ? 'text-danger-600' : 'text-gray-600'}>
                {testResults.doubao}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Supabase连接:</span>
              <span className={testResults.supabase.includes('✅') ? 'text-success-600' : testResults.supabase.includes('❌') ? 'text-danger-600' : 'text-gray-600'}>
                {testResults.supabase}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">数据库操作:</span>
              <span className={testResults.database.includes('✅') ? 'text-success-600' : testResults.database.includes('❌') ? 'text-danger-600' : 'text-gray-600'}>
                {testResults.database}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">测试操作</h2>
          
          <div className="space-y-3">
            <button
              onClick={runAllTests}
              disabled={isTesting}
              className="btn-primary w-full"
            >
              {isTesting ? '测试中...' : '运行所有测试'}
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={testDoubaoAPI}
                disabled={isTesting}
                className="btn-secondary"
              >
                测试豆包API
              </button>
              
              <button
                onClick={testSupabaseConnection}
                disabled={isTesting}
                className="btn-secondary"
              >
                测试Supabase
              </button>
              
              <button
                onClick={testDatabaseOperations}
                disabled={isTesting}
                className="btn-secondary"
              >
                测试数据库
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">环境变量检查</h2>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>豆包API URL:</span>
              <span className="font-mono text-xs">
                {process.env.NEXT_PUBLIC_DOUBAO_API_URL ? '✅ 已配置' : '❌ 未配置'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>豆包API Key:</span>
              <span className="font-mono text-xs">
                {process.env.NEXT_PUBLIC_DOUBAO_API_KEY ? '✅ 已配置' : '❌ 未配置'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Supabase URL:</span>
              <span className="font-mono text-xs">
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 已配置' : '❌ 未配置'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Supabase Anon Key:</span>
              <span className="font-mono text-xs">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 已配置' : '❌ 未配置'}
              </span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <a href="/" className="btn-secondary">
            返回首页
          </a>
        </div>
      </div>
    </div>
  )
}
