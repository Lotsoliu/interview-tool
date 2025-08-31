import { NextRequest, NextResponse } from 'next/server'
import { InterviewRecord } from '../../../types/interview'
import { generateAdaptivePrompt, detectPositionType } from '../../../lib/promptTemplates'

const DOUBAO_API_URL = process.env.DOUBAO_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'
const DOUBAO_API_KEY = process.env.DOUBAO_API_KEY || 'a96ad080-652f-4a6d-aa22-616cede91d37'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 开始处理流式分析请求')
    console.log('📡 豆包API配置:', { url: DOUBAO_API_URL, key: DOUBAO_API_KEY ? '已配置' : '未配置' })
    
    const interview: InterviewRecord = await request.json()
    console.log('📝 面试记录:', { company: interview.company, position: interview.position })
    
    // 检测职位类型并生成自适应提示词
    const positionType = detectPositionType(interview.position)
    console.log('📊 检测到职位类型:', positionType)
    
    const prompt = generateAdaptivePrompt({
      company: interview.company,
      position: interview.position,
      interviewDate: interview.interviewDate,
      interviewProcess: interview.interviewProcess
    })

    console.log('📤 发送请求到豆包API...')
    const response = await fetch(DOUBAO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'doubao-seed-1-6-thinking-250715',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: true
      })
    })

    console.log('📥 豆包API响应状态:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ 豆包API调用失败:', response.status, errorText)
      return NextResponse.json(
        { error: `豆包API调用失败: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    if (!response.body) {
      console.error('❌ 豆包API响应体为空')
      return NextResponse.json(
        { error: '豆包API响应体为空' },
        { status: 500 }
      )
    }

    console.log('✅ 开始创建流式响应...')

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()

        try {
          // 处理豆包API的响应数据
          let chunkCount = 0
          while (true) {
            const { done, value } = await reader.read()
            
            if (done) {
              console.log('✅ 流式读取完成，共处理', chunkCount, '个数据块')
              break
            }
            
            const chunkText = new TextDecoder().decode(value, { stream: true })
            chunkCount++
            
            console.log(`📦 收到豆包API原始数据块 ${chunkCount}:`, chunkText.substring(0, 100) + '...')
            
            // 按行分割SSE数据
            const lines = chunkText.split('\n')
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataContent = line.slice(6) // 移除 'data: ' 前缀
                
                // 检查是否是结束信号
                if (dataContent === '[DONE]') {
                  console.log('🏁 收到豆包API结束信号')
                  // 发送结束信号给前端
                  const endSignal = `data: {"finished": true, "reason": "completed"}\n\n`
                  controller.enqueue(new TextEncoder().encode(endSignal))
                  continue
                }
                
                try {
                  // 尝试解析JSON数据
                  const data = JSON.parse(dataContent)
                  console.log('✅ 解析豆包API数据成功:', data)
                  
                  // 提取内容
                  if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                    const content = data.choices[0].delta.content
                    
                    // 使用增强解析器处理内容，增强用户体验
                    if (content.includes('优点') || content.includes('优势')) {
                      console.log('📝 检测到优点分析内容')
                    }
                    if (content.includes('改进') || content.includes('建议')) {
                      console.log('📝 检测到改进建议内容')
                    }
                    
                    console.log('📝 提取到内容:', content)
                    
                    // 发送给前端
                    const frontendData = `data: {"chunk": ${JSON.stringify(content)}}\n\n`
                    controller.enqueue(new TextEncoder().encode(frontendData))
                  }
                } catch (parseError) {
                  console.log('⚠️ 解析豆包API响应失败:', parseError, '原始行:', dataContent)
                  // 如果不是JSON格式，可能是其他类型的响应，跳过
                  continue
                }
              }
            }
          }
        } catch (error) {
          console.error('❌ 流式读取错误:', error)
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ error: '流式读取失败: ' + (error instanceof Error ? error.message : String(error)) })}\n\n`)
          )
        } finally {
          reader.releaseLock()
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })

  } catch (error) {
    console.error('❌ API路由错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    )
  }
}
